import { block, run, move, dispose } from './injector';
import { enterScope, exitScope, setScope, getScope, createScope } from './scope';
import { obj, assign } from './utils';

/**
 * Renders key iterator block
 * @param {Component} host
 * @param {Injector} injector
 * @param {Function} get
 * @param {Function} keyExpr
 * @param {Function} body
 */
export function mountKeyIterator(host, injector, get, keyExpr, body) {
	return updateKeyIterator({
		host,
		injector,
		keyExpr,
		body,
		get,
		rendered: obj(),
		block: block(injector),
		index: 0,
		used: null
	});
}

/**
 * Updates iterator block defined in `ctx`
 * @param {object} ctx
 */
export function updateKeyIterator(ctx) {
	run(ctx.injector, ctx.block, keyIteratorHost, ctx.host, ctx);
	return ctx;
}

/**
 *
 * @param {Component} host
 * @param {Injector} injector
 * @param {object} ctx
 */
function keyIteratorHost(host, injector, ctx) {
	ctx.used = obj();
	ctx.index = 0;

	const collection = ctx.get(host, getScope(host));
	if (collection && typeof collection.forEach === 'function') {
		collection.forEach(iterator, ctx);
	}

	// Remove remaining blocks
	for (let k in ctx.rendered) {
		for (let i = 0, items = ctx.rendered[k]; i < items.length; i++) {
			dispose(injector, items[i][0], true);
		}
	}

	ctx.rendered = ctx.used;
}

function iterator(value, key) {
	const { host, injector, index, used, rendered, keyExpr, body } = this;
	const localScope = { index, key, value };
	const id = keyExpr(value, createScope(host, localScope));

	let entry = id in rendered && rendered[id].shift();
	if (entry) {
		// Update existing block
		const [b, update, scope] = entry;
		setScope(host, assign(scope, localScope));
		move(injector, b, injector.ptr);
		run(injector, b, update, host, scope);
		exitScope(host);
	} else {
		// Create & render new block
		const b = block(injector);
		const scope = enterScope(host, localScope);
		const update = run(injector, b, body, host, scope);
		exitScope(host);
		entry = [b, update, scope];
	}

	// Mark block as used.
	// We allow multiple items key in case of poorly prepared data.
	if (id in used) {
		used[id].push(entry);
	} else {
		used[id] = [entry];
	}

	this.index++;
}
