/**
 * @typedef {Object} Injector
 * @property {Element} parentNode Injector DOM target
 * @property {Node[] | Block[]} items Current injector contents
 * @property {number} ptr Current insertion pointer
 * @property {Block[]} stack Block context stack
 */

/**
 * @typedef {Object} Block
 * @property {number} inserted Number of inserted items in block context
 * @property {number} deleted Number of deleted items in block context
 * @property {number} size Amount of items in current block
 */

const injectorKey = '&injector';
const blockKey = '&block';

/**
 * Creates injector instance for given target, if required
 * @param {Element | Injector} target
 * @returns {Injector}
 */
export function createInjector(target) {
	if (isObject(target) && injectorKey in target) {
		return target;
	}

	return {
		[injectorKey]: true,
		parentNode: target,
		items: [],
		stack: [],
		ptr: 0
	};
}

/**
 * Runs `fn` template function in context of given `block`
 * @param {Injector} injector
 * @param {Block} block
 * @param {Function} fn
 * @param {*} ctx
 * @returns {*} Result of `fn` function call
 */
export function run(injector, block, fn, ctx) {
	enter(injector, block);
	const result = typeof fn === 'function' ? fn(ctx, injector) : void 0;
	exit(injector);
	return result;
}

/**
 * Creates block for given injector
 * @param {Injector} injector
 * @returns {Block}
 */
export function block(injector) {
	const block = {
		[blockKey]: true,
		inserted: 0,
		deleted: 0,
		size: 0
	};

	injector.items.splice(injector.ptr++, 0, block);
	inc(injector);
	return block;
}

/**
 * Enters block rendering context
 * @param {Injector} injector
 * @param {Block} block
 */
export function enter(injector, block) {
	injector.stack.push(block);
	injector.ptr = index(injector, block) + 1;
}

/**
 * Exit block rendering context
 * @param {Injector} injector
 * @returns {Block}
 */
export function exit(injector) {
	const { stack, items } = injector;
	const block = stack.pop();
	const lastBlock = stack.length ? last(stack) : null;

	if (block) {
		if (lastBlock) {
			consume(lastBlock, block);
		} else {
			reset(block);
		}
		injector.ptr = index(injector, block) + block.size + 1;
	} else {
		injector.ptr = items.length;
	}

	return block;
}

/**
 * Inserts given node into current context
 * @param {injector} injector
 * @param {Node} node
 * @returns {Node}
 */
export function insert(injector, node) {
	domInsert(node, injector.parentNode, getAnchorNode(injector, injector.ptr));
	injector.items.splice(injector.ptr++, 0, node);
	inc(injector);
	return node;
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

	const { items, stack, parentNode } = injector;
	const ix = items.indexOf(block) + (self ? 0 : 1);
	const size = block.deleted;

	if (size) {
		if (stack.length) {
			consume(last(stack), block);
		}
		items.splice(ix, size).forEach(item => {
			if (!isBlock(item)) {
				parentNode.removeChild(item);
			}
		});
	}

	injector.ptr = ix;
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
 * Returns last item of given array
 * @param {Array} arr
 * @return {*}
 */
function last(arr) {
	return arr[arr.length - 1];
}

/**
 * Increments size of context block
 * @param {Injector} injector
 */
function inc(injector) {
	if (injector.stack.length) {
		markInsert(last(injector.stack));
	}
}

/**
 * Get index of given item in injector’s item list
 * @param {Injector} injector
 * @param {Block | Node} item
 * @return {number}
 */
function index(injector, item) {
	return injector.items.indexOf(item);
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
 * @returns {Boolean}
 */
function isBlock(obj) {
	return isObject(obj) && blockKey in obj;
}

/**
 * Check if given value is an object
 * @param {*} value
 * @returns {Boolean}
 */
function isObject(value) {
	return value && typeof value === 'object';
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
