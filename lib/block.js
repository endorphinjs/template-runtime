import { run, block, dispose } from './injector';
import { getScope } from './scope';

/**
 * Initial block rendering
 * @param {Component} component
 * @param {Injector} injector
 * @param {Function} get
 * @returns {BlockContext}
 */
export function mountBlock(component, injector, get) {
	/** @type {BlockContext} */
	const ctx = {
		component,
		injector,
		block: block(injector),
		get,
		fn: null,
		update: null
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
	const { component, injector, block, update } = ctx;
	const scope = getScope(component);
	const fn = ctx.get(component, scope, injector);

	if (ctx.fn !== fn) {
		updated = 1;
		// Unmount previously rendered content
		ctx.fn && dispose(injector, block, false);

		// Mount new block content
		ctx.update = fn ? run(injector, block, fn, component, scope) : null;
		ctx.fn = fn;
	} else if (update) {
		// Update rendered result
		updated = run(injector, block, update, component, scope) ? 1 : 0;
	}

	return updated;
}
