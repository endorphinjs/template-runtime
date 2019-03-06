import { run, block, dispose } from './injector';
import { getScope } from './scope';

/**
 * Initial block rendering
 * @param {Component} host
 * @param {Injector} injector
 * @param {Function} get
 * @returns {BlockContext}
 */
export function mountBlock(host, injector, get) {
	/** @type {BlockContext} */
	const ctx = {
		host,
		injector,
		block: block(injector),
		scope: getScope(host),
		get,
		fn: undefined,
		update: undefined
	};
	updateBlock(ctx);
	return ctx;
}

/**
 * Updated block, described in `ctx` object
 * @param {BlockContext} ctx
 * @returns {number} Returns `1` if block was updated, `0` otherwise
 */
export function updateBlock(ctx) {
	let updated = 0;
	const { host, injector, scope, block, update } = ctx;
	const fn = ctx.get(host, scope, injector);

	if (ctx.fn !== fn) {
		updated = 1;
		// Unmount previously rendered content
		ctx.fn && dispose(injector, block, scope, false);

		// Mount new block content
		ctx.update = fn ? run(injector, block, fn, host, scope) : null;
		ctx.fn = fn;
	} else if (update) {
		// Update rendered result
		updated = run(injector, block, update, host, scope) ? 1 : 0;
	}

	return updated;
}

/**
 * @param {BlockContext} ctx
 */
export function unmountBlock(ctx) {
	dispose(ctx.injector, ctx.block, ctx.scope, true);
}
