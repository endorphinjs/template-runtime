import { changeSet, obj } from './utils';
import { animate } from './animation';

/**
 * @typedef {Object} Injector
 * @property {Element} parentNode Injector DOM target
 * @property {Node[] | Block[]} items Current injector contents
 * @property {number} ptr Current insertion pointer
 * @property {Block} ctx Current block context
 * @property {object} slots Slots container
 * @property {object} attributes Pending attributes updates
 * @property {object} events Current event handlers
 * @property {object} refs Current element references
 */

/**
 * @typedef {Object} Block
 * @property {number} inserted Number of inserted items in block context
 * @property {number} deleted Number of deleted items in block context
 * @property {number} size Amount of items in current block
 */

const blockKey = '&block';

/**
 * Creates injector instance for given target, if required
 * @param {Element | Injector} target
 * @param {boolean} slotted Use slotted model for storing elements
 * @returns {Injector}
 */
export function createInjector(target, slotted) {
	return {
		parentNode: target,
		items: [],
		ctx: null,
		ptr: 0,
		slots: slotted ? obj() : null,
		attributes: changeSet(),
		events: changeSet()
	};
}

/**
 * Creates block for given injector
 * @param {Injector} injector
 * @returns {Block}
 */
export function block(injector) {
	return add(injector, {
		[blockKey]: true,
		inserted: 0,
		deleted: 0,
		size: 0
	});
}

/**
 * Runs `fn` template function in context of given `block`
 * @param {Injector} injector
 * @param {Block} block
 * @param {Function} fn
 * @param {Scope} scope
 * @param {*} data
 * @returns {*} Result of `fn` function call
 */
export function run(injector, block, fn, scope, data) {
	let result;
	const ix = injector.items.indexOf(block);

	if (typeof fn === 'function') {
		const ctx = injector.ctx;
		injector.ptr = ix + 1;
		injector.ctx = block;
		result = fn(scope, injector, data);
		injector.ctx = ctx;
		ctx ? consume(ctx, block) : reset(block);
	}

	injector.ptr = ix + block.size + 1;
	return result;
}

/**
 * Inserts given node into current context
 * @param {Injector} injector
 * @param {Node} node
 * @returns {Node}
 */
export function insert(injector, node, slotName = '') {
	let target;
	const { slots } = injector;

	if (slots) {
		target = slots[slotName] || (slots[slotName] = document.createDocumentFragment());
	} else {
		target = injector.parentNode;
	}

	domInsert(node, target, getAnchorNode(injector.items, injector.ptr, target));
	return add(injector, node);
}

/**
 * Adds given item into current injector position
 * @param {Injector} injector
 * @param {Block | Node | Function} item
 */
export function add(injector, item) {
	injector.items.splice(injector.ptr++, 0, item);
	injector.ctx && markInsert(injector.ctx);
	return item;
}

/**
 * Moves contents of given block at `pos` location, effectively updating
 * inserted nodes in parent context
 * @param {Injector} injector
 * @param {Block} block
 * @param {Number} pos
 */
export function move(injector, block, pos) {
	const { items } = injector;

	if (items[pos] === block) {
		return;
	}

	// Move block contents at given position
	const curPos = items.indexOf(block);
	const blockItems = items.splice(curPos, block.size + 1);

	if (curPos < pos) {
		pos -= blockItems.length;
	}

	for (let i = blockItems.length - 1, item; i >= 0; i--) {
		item = blockItems[i];
		if (!isBlock(item)) {
			domInsert(item, item.parentNode, getAnchorNode(items, pos, item.parentNode));
		}
		items.splice(pos, 0, item);
	}
}

/**
 * Disposes contents of given block
 * @param {Injector} injector
 * @param {Block} block
 * @param {Boolean} self Remove block item as well
 */
export function dispose(injector, block, self) {
	markDisposed(block, self);

	const { items, ctx } = injector;
	const ix = items.indexOf(block) + (self ? 0 : 1);
	const size = block.deleted;

	if (size) {
		ctx && consume(ctx, block);

		for (let i = ix, item; i < ix + size; i++) {
			item = items[i];

			// TODO seems like `markDisposed()` is not required for inner blocks
			// since we already disposed parent block. But unit-tests fail. Check
			// if it’s safe to remove `markDisposed()` in this case
			if (isBlock(item)) {
				markDisposed(item, false);
			} else {
				animate(item, 'out', domRemove);
			}
		}

		items.splice(ix, size);
	}
}

/**
 * Get DOM node nearest to given position of items list
 * @param {Element[] | Block[]} items
 * @param {number} ix
 * @param {Element} parent Ensure element has given element as parent node
 * @returns {Node}
 */
function getAnchorNode(items, ix, parent) {
	while (ix < items.length) {
		const item = items[ix++];
		if (item.parentNode === parent) {
			return item;
		}
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
 * Marks current block content as disposed
 * @param {Block} block
 * @param {Boolean} self Marks block itself as removed
 */
function markDisposed(block, self) {
	block.deleted += block.size + (self ? 1 : 0);
	block.size = 0;
}

/**
 * Consumes data from given `child` block by parent `block`
 * @param {Block} block
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
export function isBlock(obj) {
	return blockKey in obj;
}

/**
 * @param {Node} node
 * @param {Element} parent
 * @param {Element} anchor
 * @returns {Node} Inserted item
 */
function domInsert(node, parent, anchor) {
	return anchor != null ? parent.insertBefore(node, anchor) : parent.appendChild(node);
}

/**
 * Removes given DOM node from its tree
 * @param {Node} node
 */
function domRemove(node) {
	const parent = node.parentNode;
	parent && parent.removeChild(node);
}
