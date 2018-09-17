import { isInternalObject } from './utils';

/**
 * @typedef {Object} Injector
 * @property {Element} parentNode Injector DOM target
 * @property {Node[] | Block[]} items Current injector contents
 * @property {number} ptr Current insertion pointer
 * @property {Block} ctx Current block context
 * @property {object} attributes Last known attributes values
 * @property {number} updated Byte mask indicating current injector state has pending updates
 */

/**
 * @typedef {Object} Block
 * @property {string} type Block type
 * @property {*} data Arbitrary block data
 * @property {function} dispose Custom function to dispose block content
 * @property {number} inserted Number of inserted items in block context
 * @property {number} deleted Number of deleted items in block context
 * @property {number} size Amount of items in current block
 */

const blockKey = '&block';

/**
 * Creates injector instance for given target, if required
 * @param {Element | Injector} target
 * @returns {Injector}
 */
export function createInjector(target) {
	return {
		parentNode: target,
		items: [],
		ctx: null,
		ptr: 0,
		attributes: null,
		updated: 0
	};
}

/**
 * Creates block for given injector
 * @param {Injector} injector
 * @param {String} [type]
 * @returns {Block}
 */
export function block(injector, type) {
	return add(injector, {
		[blockKey]: true,
		type,
		data: null,
		dispose: null,
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
 * @returns {*} Result of `fn` function call
 */
export function run(injector, block, fn, scope) {
	let result;
	const ix = injector.items.indexOf(block);
	const ctx = injector.ctx;

	if (typeof fn === 'function') {
		injector.ptr = ix + 1;
		injector.ctx = block;
		result = fn(scope, injector);
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
export function insert(injector, node) {
	domInsert(node, injector.parentNode, getAnchorNode(injector, injector.ptr));
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
	const { items, parentNode } = injector;

	if (items[pos] === block) {
		return;
	}

	// Move block contents at given position
	let anchor = getAnchorNode(injector, pos);
	const curPos = items.indexOf(block);
	const blockItems = items.splice(curPos, block.size + 1);

	if (curPos < pos) {
		pos -= blockItems.length;
	}

	for (let i = blockItems.length - 1, item; i >= 0; i--) {
		item = blockItems[i];
		items.splice(pos, 0, item);
		if (!isBlock(item)) {
			anchor = domInsert(item, parentNode, anchor);
		}
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

	const { items, parentNode, ctx } = injector;
	const ix = items.indexOf(block) + (self ? 0 : 1);
	const size = block.deleted;

	if (size) {
		ctx && consume(ctx, block);

		// First we have to mark items as disposed before removing them from
		// list to allow their dispose method work properly
		for (let i = ix; i < ix + size; i++) {
			const item = items[i];
			if (isBlock(item)) {
				markDisposed(item, false);
			} else {
				parentNode.removeChild(item);
			}
		}

		items.splice(ix, size);
	}
}

/**
 * Get DOM node nearest to given position of items list
 * @param {Injector} injector
 * @param {number} ix
 * @returns {Node}
 */
function getAnchorNode(injector, ix) {
	while (ix < injector.items.length) {
		const item = injector.items[ix++];
		if (!isBlock(item)) {
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
	block.dispose && block.dispose();
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
 * @returns {Boolean}
 */
export function isBlock(obj) {
	return isInternalObject(obj, blockKey);
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
