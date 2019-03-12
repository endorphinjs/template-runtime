import { createList, createListItem, listInsertAfter, listPrepend, listRemove } from './linked-list';
import { changeSet } from './utils';

/**
 * Creates injector instance for given target, if required
 * @param {Element} target
 * @returns {Injector}
 */
export function createInjector(target) {
	return {
		parentNode: target,
		items: createList(),
		ctx: null,
		ptr: null,

		// NB create `slots` placeholder to promote object to hidden class.
		// Do not use any additional function argument for adding value to `slots`
		// to reduce runtime checks and keep functions in monomorphic state
		slots: null,
		attributes: changeSet(),
		events: changeSet()
	};
}

/**
 * Inserts given node into current context
 * @param {Injector} injector
 * @param {Node} node
 * @returns {Node}
 */
export function insert(injector, node, slotName = '') {
	let target;
	const { items, slots, ptr } = injector;
	const item = createListItem(node);

	if (slots) {
		target = slots[slotName] || (slots[slotName] = document.createDocumentFragment());
	} else {
		target = injector.parentNode;
	}

	domInsert(node, target, ptr && getAnchorNode(ptr.next, target));

	if (ptr) {
		listInsertAfter(ptr, item);
	} else {
		listPrepend(items, item);
	}

	injector.ptr = item;

	return node;
}

/**
 * Injects given block
 * @template {BaseBlock} T
 * @param {Injector} injector
 * @param {T} block
 * @returns {T}
 */
export function injectBlock(injector, block) {
	const start = block.start = createListItem(block);
	const end = block.end = createListItem(block);
	const { items, ptr } = injector;

	if (ptr) {
		listInsertAfter(ptr, end);
		listInsertAfter(ptr, start);
	} else {
		listPrepend(items, end);
		listPrepend(items, start);
	}

	injector.ptr = end;

	return block;
}

/**
 * Runs `fn` template function in context of given `block`
 * @param {BaseBlock} block
 * @param {Function} fn
 * @param {*} data
 * @returns {*} Result of `fn` function call
 */
export function run(block, fn, data) {
	const { host, injector } = block;
	const { ctx } = injector;
	injector.ctx = block;
	injector.ptr = block.start;
	const result = fn(host, injector, data);
	injector.ptr = block.end;
	injector.ctx = ctx;

	return result;
}

/**
 * Empties content of given block
 * @param {BaseBlock} block
 */
export function emptyBlockContent(block) {
	if (block.dispose) {
		block.dispose(block.scope);
		block.dispose = null;
	}

	let item = block.start.next;
	while (item && item !== block.end) {
		let { value, next, prev } = item;

		if (isBlock(value)) {
			next = value.end.next;
			disposeBlock(value);
		} else {
			domRemove(value);
		}

		prev.next = next;
		next.prev = prev;
		item = next;
	}
}

/**
 * Moves contents of `block` after `ref` list item
 * @param {Injector} injector
 * @param {BaseBlock} block
 * @param {LinkedListItem<any>} [ref]
 */
export function move(injector, block, ref) {
	if (ref && ref.next && ref.next.value === block) {
		return;
	}

	// Update linked list
	const { items } = injector;
	const { start, end } = block;

	if (ref) {
		const { prev } = start;
		const { next } = end;

		if (end.next = ref.next) {
			end.next.prev = end;
		}

		ref.next = start;
		start.prev = ref;

		if (prev) {
			prev.next = next;
		} else {
			items.head = ref;
		}

		if (next) {
			next.prev = prev;
		}
	} else {
		// No ref: insert as first item in list
		if (start.prev) {
			start.prev.next = end.next;
		}

		if (end.next = items.head) {
			end.next.prev = end;
		}

		start.prev = null;
		items.head = start;
	}

	// Move block contents in DOM
	let item = start.next, node;
	while (item !== end) {
		if (!isBlock(item.value)) {
			/** @type {Node} */
			node = item.value;

			// NB it’s possible that a single block contains nodes from different
			// slots so we have to find anchor for each node individually
			domInsert(node, node.parentNode, getAnchorNode(end.next, node.parentNode));
		}
		item = item.next;
	}
}

/**
 * Disposes given block
 * @param {BaseBlock} block
 */
export function disposeBlock(block) {
	emptyBlockContent(block);

	const { items } = block.injector;
	listRemove(items, block.start);
	listRemove(items, block.end);
	block.start = block.end = null;
}

/**
 * Check if given value is a block
 * @param {*} obj
 * @returns {boolean}
 */
function isBlock(obj) {
	return '$$block' in obj;
}

/**
 * Get DOM node nearest to given position of items list
 * @param {LinkedListItem} item
 * @param {Node} parent Ensure element has given element as parent node
 * @returns {Node}
 */
function getAnchorNode(item, parent) {
	while (item) {
		if (item.value.parentNode === parent) {
			return item.value;
		}

		item = item.next;
	}
}

/**
 * @param {Node} node
 * @param {Node} parent
 * @param {Node} anchor
 * @returns {Node} Inserted item
 */
function domInsert(node, parent, anchor) {
	return anchor
		? parent.insertBefore(node, anchor)
		: parent.appendChild(node);
}

/**
 * Removes given DOM node from its tree
 * @param {Node} node
 */
function domRemove(node) {
	const parent = node.parentNode;
	parent && parent.removeChild(node);
}
