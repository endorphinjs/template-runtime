import { block, run, move, dispose } from './injector';
import { enterScope, exitScope } from './scope';
import { obj } from './utils';

/**
 * Renders key iterator block
 * @param {Component} host
 * @param {Injector} injector
 * @param {Function} get
 * @param {Function} keyExpr
 * @param {Function} body
 */
export function mountKeyIterator(host, injector, get, keyExpr, body) {
	const ctx = {
		host,
		injector,
		get,
		rendered: obj(),
		block: block(injector),
		index: 0,
		used: null,
		iterator(value, key) {
			const id = keyExpr(value);
			const { index, used, rendered } = ctx;

			enterScope(host, { index, key, value });

			let entry = id in rendered && rendered[id].shift();
			if (entry) {
				// Update existing block
				move(injector, entry[0], injector.ptr);
				run(injector, entry[0], entry[1], host);
			} else {
				// Create & render new block
				const b = block(injector);
				const update = run(injector, b, body, host);
				entry = [b, update];
			}

			// Mark block as used.
			// We allow multiple items key in case of poorly prepared data.
			if (id in used) {
				used[id].push(entry);
			} else {
				used[id] = [entry];
			}

			exitScope(host);
			ctx.index++;
		}
	};

	return updateKeyIterator(ctx);
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

	const collection = ctx.get(host);
	if (collection && typeof collection.forEach === 'function') {
		collection.forEach(ctx.iterator);
	}

	// Remove remaining blocks
	for (let k in ctx.rendered) {
		for (let i = 0, items = ctx.rendered[k]; i < items.length; i++) {
			dispose(host, injector, items[i][0], true);
		}
	}

	ctx.rendered = ctx.used;
}
