import { block, run, dispose } from './injector';
import { enterScope, exitScope, setScope, getScope } from './scope';
import { assign } from './utils';

/**
 * Mounts iterator block
 * @param {Component} host
 * @param {Injector} injector
 * @param {Function} get A function that returns collection to iterate
 * @param {Function} body A function that renders item of iterated collection
 * @returns {IteratorContext}
 */
export function mountIterator(host, injector, get, body) {
	/** @type {IteratorContext} */
	const ctx = {
		host,
		injector,
		get,
		body,
		block: block(injector),
		scope: getScope(host),
		index: 0,
		rendered: [],
		updated: 0
	};
	updateIterator(ctx);
	return ctx;
}

/**
 * Updates iterator block defined in `ctx`
 * @param {IteratorContext} ctx
 * @returns {number} Returns `1` if iterator was updated, `0` otherwise
 */
export function updateIterator(ctx) {
	run(ctx.injector, ctx.block, iteratorHost, ctx.host, ctx) ? 1 : 0;
	return ctx.updated;
}

/**
 *
 * @param {IteratorContext} ctx
 */
export function unmountIterator(ctx) {
	const { rendered, injector } = ctx;
	let item;

	while (item = rendered.pop()) {
		dispose(injector, item[0], item[2], true);
	}
}

/**
 *
 * @param {Component} host
 * @param {Injector} injector
 * @param {IteratorContext} ctx
 */
function iteratorHost(host, injector, ctx) {
	ctx.index = 0;
	ctx.updated = 0;
	const collection = ctx.get(host, ctx.scope);
	if (collection && typeof collection.forEach === 'function') {
		collection.forEach(iterator, ctx);
	}

	// Remove remaining blocks
	let item;
	while (ctx.rendered.length > ctx.index) {
		ctx.updated = 1;
		item = ctx.rendered.pop();
		dispose(injector, item[0], item[2], true);
	}
}

/**
 * @this {IteratorContext}
 * @param {*} value
 * @param {*} key
 */
function iterator(value, key) {
	const { host, injector, rendered, index } = this;
	const localScope = { index, key, value };

	if (index < rendered.length) {
		// Update existing block
		const [b, update, scope] = rendered[index];
		setScope(host, assign(scope, localScope));
		if (run(injector, b, update, host, scope)) {
			this.updated = 1;
		}
		exitScope(host);
	} else {
		// Create & render new block
		const b = block(injector);
		const scope = enterScope(host, localScope);
		const update = run(injector, b, this.body, host, scope);
		exitScope(host);
		rendered.push([b, update, scope]);
		this.updated = 1;
	}

	this.index++;
}
