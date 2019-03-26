import { run, move, injectBlock, disposeBlock } from './injector';
import { setScope, getScope } from './scope';
import { obj } from './utils';
import { prepareScope } from './iterate';

/**
 * Renders key iterator block
 * @param {Component} host
 * @param {Injector} injector
 * @param {Function} get
 * @param {Function} keyExpr
 * @param {Function} body
 * @returns {KeyIteratorBlock}
 */
export function mountKeyIterator(host, injector, get, keyExpr, body) {
	const parentScope = getScope(host);
	/** @type {KeyIteratorBlock} */
	const block = injectBlock(injector, {
		$$block: true,
		host,
		injector,
		scope: obj(parentScope),
		dispose: null,
		get,
		body,
		keyExpr,
		index: 0,
		updated: 0,
		rendered: null,
		needReorder: false,
		parentScope,
		order: [],
		used: null,
		start: null,
		end: null
	});
	updateKeyIterator(block);
	return block;
}

/**
 * Updates iterator block defined in `ctx`
 * @param {KeyIteratorBlock} block
 * @returns {number} Returns `1` if iterator was updated, `0` otherwise
 */
export function updateKeyIterator(block) {
	run(block, keyIteratorHost, block);
	return block.updated;
}

/**
 * @param {KeyIteratorBlock} ctx
 */
export function unmountKeyIterator(ctx) {
	disposeBlock(ctx);
}

/**
 *
 * @param {Component} host
 * @param {Injector} injector
 * @param {KeyIteratorBlock} block
 */
function keyIteratorHost(host, injector, block) {
	block.used = obj();
	block.index = 0;
	block.updated = 0;
	block.needReorder = false;

	const collection = block.get(host, block.parentScope);
	if (collection && typeof collection.forEach === 'function') {
		collection.forEach(iterator, block);
	}

	const { rendered } = block;
	for (let p in rendered) {
		for (let i = 0, items = rendered[p]; i < items.length; i++) {
			block.updated = 1;
			disposeBlock(items[i]);
		}
	}

	if (block.needReorder) {
		reorder(block);
	}

	block.order.length = 0;
	block.rendered = block.used;
}

/**
 * @param {IteratorItemBlock} expected
 * @param {KeyIteratorBlock} owner
 * @returns {IteratorItemBlock | null}
 */
function getItem(expected, owner) {
	return expected.owner === owner ? expected : null;
}

/**
 * @this {KeyIteratorBlock}
 * @param {*} value
 * @param {*} key
 */
function iterator(value, key) {
	const { host, injector, index, rendered } = this;
	const id = getId(this, index, key, value);
	// TODO make `rendered` a linked list for faster insert and remove
	let entry = rendered && id in rendered ? rendered[id].shift() : null;

	const prevScope = getScope(host);
	const scope = prepareScope(entry ? entry.scope : obj(this.scope), index, key, value);
	setScope(host, scope);

	if (!entry) {
		entry = injector.ctx = createItem(this, scope);
		injector.ptr = entry.start;
		entry.update = this.body(host, injector, scope);
		this.updated = 1;
	} else if (entry.update) {
		if (entry.start.prev !== injector.ptr) {
			this.needReorder = true;
		}

		if (entry.update(host, injector, scope)) {
			this.updated = 1;
		}
	}

	setScope(host, prevScope);

	markUsed(this, id, entry);
	injector.ptr = entry.end;
	this.index++;
}

/**
 * @param {KeyIteratorBlock} block
 */
function reorder(block) {
	const { injector, order } = block;
	let actualPrev, actualNext;
	let expectedPrev, expectedNext;

	for (let i = 0, maxIx = order.length - 1, item; i <= maxIx; i++) {
		item = order[i];
		expectedPrev = i > 0 ? order[i - 1] : null;
		expectedNext = i < maxIx ? order[i + 1] : null;
		actualPrev = getItem(item.start.prev.value, block);
		actualNext = getItem(item.end.next.value, block);

		if (expectedPrev !== actualPrev && expectedNext !== actualNext) {
			// Blocks must be reordered
			move(injector, item, expectedPrev ? expectedPrev.end : block.start);
		}
	}
}

/**
 * @param {KeyIteratorBlock} iterator
 * @param {string} id
 * @param {IteratorItemBlock} block
 */
function markUsed(iterator, id, block) {
	const { used } = iterator;
	// We allow multiple items key in case of poorly prepared data.
	if (id in used) {
		used[id].push(block);
	} else {
		used[id] = [block];
	}

	iterator.order.push(block);
}

/**
 * @param {KeyIteratorBlock} iterator
 * @param {number} index
 * @param {*} key
 * @param {*} value
 * @return {string}
 */
function getId(iterator, index, key, value) {
	return iterator.keyExpr(value, prepareScope(iterator.scope, index, key, value));
}

/**
 * @param {KeyIteratorBlock} iterator
 * @param {Object} scope
 * @returns {IteratorItemBlock}
 */
function createItem(iterator, scope) {
	return injectBlock(iterator.injector, {
		$$block: true,
		host: iterator.host,
		injector: iterator.injector,
		scope,
		dispose: null,
		update: undefined,
		owner: iterator,
		start: null,
		end: null
	});
}
