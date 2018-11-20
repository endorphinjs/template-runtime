import { run, block, dispose } from './injector';

/**
 * Initial block rendering
 * @param {Component} component
 * @param {Injector} injector
 * @param {function} get
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
 * @param {object} ctx
 */
export function updateBlock(ctx) {
	const { component, injector, block, update } = ctx;
	const fn = ctx.get(component, injector);

	if (ctx.fn !== fn) {
		// Unmount previously rendered content
		ctx.fn && dispose(component, injector, block, false);

		// Mount new block content
		ctx.update = fn ? run(injector, block, fn, component) : null;
		ctx.fn = fn;
	} else if (update) {
		// Update rendered result
		run(injector, block, update, component);
	}

	return ctx;
}
