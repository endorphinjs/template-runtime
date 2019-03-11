import { changeSet } from './utils';
import { createList, createListItem, listInsert } from './linked-list';

const blockKey = '&block';

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
 * Creates block for given injector
 * @param {Injector} injector
 * @returns {LinkedListItem<Block>}
 */
export function block(injector) {
	return add(injector, {
		[blockKey]: true,
		inserted: 0,
		deleted: 0,
		size: 0,
		dispose: null
	});
}

/**
 * Runs `fn` template function in context of given `block`
 * @param {Injector} injector
 * @param {LinkedListItem} blockItem
 * @param {Function} fn
 * @param {Component} component
 * @param {*} data
 * @returns {*} Result of `fn` function call
 */
export function run(injector, blockItem, fn, component, data) {
	let result;
	const block = /** @type {Block} */ (blockItem.value);
	const ctx = injector.ctx;

	injector.ptr = blockItem;
	injector.ctx = block;
	result = fn(component, injector, data);
	injector.ctx = ctx;
	ctx ? consume(ctx, block) : reset(block);

	return result;
}

/**
 * Inserts given node into current context
 * @param {Injector} injector
 * @param {Node} node
 * @returns {LinkedListItem<Node>}
 */
export function insert(injector, node, slotName = '') {
	let target;
	const { slots } = injector;

	if (slots) {
		target = slots[slotName] || (slots[slotName] = document.createDocumentFragment());
	} else {
		target = injector.parentNode;
	}

	domInsert(node, target, getAnchorNode(injector.ptr, target));
	return add(injector, node);
}

/**
 * Moves contents of given block `item` right after `after` location, effectively updating
 * inserted nodes in parent context
 * @param {Injector} injector
 * @param {LinkedListItem<Block>} item
 * @param {LinkedListItem} ptr
 */
export function move(injector, item, ptr) {
	if (item === ptr) {
		return;
	}

	const { items, parentNode } = injector;
	const anchor = ptr && getAnchorNode(ptr, parentNode);
	const head = item;
	let tail = /** @type {LinkedListItem} */ (item);
	let { size } = item.value;

	while (size--) {
		tail = tail.next;
		if (!isBlock(tail.value)) {
			domInsert(/** @type {Node} */(tail.value), parentNode, anchor);
		}
	}

	if (ptr) {
		head.prev = ptr;
		tail.next = ptr.next;
		ptr.next = head;
	} else {
		tail.next = items.head;
		items.head = head;
		head.prev = null;
	}
}

/**
 * Disposes contents of given block
 * @param {Injector} injector
 * @param {LinkedListItem<Block>} item
 * @param {Object} scope
 * @param {boolean} self Remove block item as well
 */
export function dispose(injector, item, scope, self) {
	disposeBlock(item.value, scope, self);

	let size = item.value.deleted;

	/** @type {LinkedListItem} */
	const head = self ? item : item.next;

	/** @type {LinkedListItem} */
	let tail = head;

	injector.ctx && consume(injector.ctx, item.value);

	do {
		domRemove(tail.value);
		tail.value = null;
		tail = tail.next;
	} while(size--);

	head.prev = tail.next;
	if (head !== tail) {
		head.next = tail.prev = null;
	}
}

/**
 * Disposes given block
 * @param {Block} block
 * @param {Object} scope
 * @param {boolean} self Dispose block itself
 * @returns {void} Should return nothing since function result will be used
 * as shorthand to reset cached value
 */
export function disposeBlock(block, scope, self) {
	if (block.dispose) {
		block.dispose(scope);
		block.dispose = null;
	}
	block.deleted += block.size + (self ? 1 : 0);
	block.size = 0;
}

/**
 * Adds given item into current injector position
 * @param {Injector} injector
 * @param {InjectorItem} value
 * @return {LinkedListItem}
 */
function add(injector, value) {
	const item = createListItem(value);
	listInsert(injector.items, item, injector.ptr);
	injector.ctx && markInsert(injector.ctx);
	return item;
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
 * @param {Block} block
 */
function markInsert(block) {
	block.inserted++;
	block.size++;
}

/**
 * Consumes data from given `child` block by parent `block`
 * @param {Block} block
 * @param {Block} child
 */
function consume(block, child) {
	block.inserted += child.inserted;
	block.deleted += child.deleted;
	block.size += child.inserted - child.deleted;
	reset(child);
}

/**
 * Reset session data from given block
 * @param {Block} block
 */
function reset(block) {
	block.inserted = block.deleted = 0;
}

/**
 * Check if given value is a block
 * @param {*} obj
 * @returns {boolean}
 */
function isBlock(obj) {
	return blockKey in obj;
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
