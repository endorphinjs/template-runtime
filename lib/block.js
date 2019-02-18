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
	return updateBlock({
		component,
		injector,
		block: block(injector),
		get,
		fn: null,
		update: null,
	});
}

/**
 * Updated block, described in `ctx` object
 * @param {BlockContext} ctx
 * @returns {BlockContext}
 */
export function updateBlock(ctx) {
	const { component, injector, block, update } = ctx;
	const scope = getScope(component);
	const fn = ctx.get(component, injector, scope);

	if (ctx.fn !== fn) {
		// Unmount previously rendered content
		ctx.fn && dispose(injector, block, false);

		// Mount new block content
		ctx.update = fn ? run(injector, block, fn, component, scope) : null;
		ctx.fn = fn;
	} else if (update) {
		// Update rendered result
		run(injector, block, update, component, scope);
	}

	return ctx;
}
