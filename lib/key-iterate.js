import { run, move, injectBlock, disposeBlock } from './injector';
import { enterScope, exitScope, setScope, getScope, createScope } from './scope';
import { obj, assign } from './utils';

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
	/** @type {KeyIteratorBlock} */
	const block = injectBlock(injector, {
		$$block: true,
		host,
		injector,
		scope: getScope(host),
		dispose: null,
		prev: null,
		get,
		body,
		keyExpr,
		index: 0,
		updated: 0,
		rendered: obj(),
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

	// Do some tricks for better Virtual Scroll lists:
	// for example, when we transition from [1, 2, 3] list to [2, 3, 4],
	// default algorithm will cause 2 and 3 to be moved before 1, which leads to
	// lots of unnecessary DOM operations. By manually controlling `.ptr`, we can
	// keyed iterator to update 2 and 3 (if required), add 4 and remove 1
	injector.ptr = null;

	const collection = block.get(host, block.scope);
	if (collection && typeof collection.forEach === 'function') {
		collection.forEach(iterator, block);
	}

	const { rendered } = block;
	for (let p in rendered) {
		for (let i = 0, items = rendered[p]; i < items.length; i++) {
			disposeBlock(items[i]);
		}
	}

	block.rendered = block.used;
}

/**
 * @this {KeyIteratorBlock}
 * @param {*} value
 * @param {*} key
 */
function iterator(value, key) {
	const { host, injector, index, rendered, used, body } = this;
	const localScope = { index, key, value };
	const id = this.keyExpr(value, createScope(host, localScope));
	let entry = id in rendered ? rendered[id].shift() : null;

	if (entry) {
		// Update existing block
		if (injector.ptr) {
			move(injector, entry, injector.ptr);
		}

		if (entry.update) {
			setScope(host, assign(entry.scope, localScope));
			if (run(entry, entry.update, entry.scope)) {
				this.updated = 1;
			}
			exitScope(host);
		}
	} else {
		// Create & render new block
		if (!injector.ptr) {
			injector.ptr = this.start;
		}

		/** @type {IteratorItemBlock} */
		entry = injectBlock(injector, {
			$$block: true,
			host,
			injector,
			scope: enterScope(host, localScope),
			dispose: null,
			update: undefined,
			owner: this,
			start: null,
			end: null
		});

		entry.update = run(entry, body, entry.scope);
		this.updated = 1;
		exitScope(host);
	}

	// Mark block as used.
	// We allow multiple items key in case of poorly prepared data.
	if (id in used) {
		used[id].push(entry);
	} else {
		used[id] = [entry];
	}

	injector.ptr = entry.end;
	this.index++;
}
