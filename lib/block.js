import { run, block, dispose } from './injector';

/**
 * Initial block rendering
 * @param {Scope} scope
 * @param {Injector} injector
 * @param {function} get
 */
export function mountBlock(scope, injector, get) {
	return updateBlock({
		scope,
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
	const { scope, injector, block, update } = ctx;
	const fn = ctx.get(scope, injector);

	if (ctx.fn !== fn) {
		// Unmount previously rendered content
		ctx.fn && dispose(injector, block, false);

		// Mount new block content
		ctx.update = fn ? run(injector, block, fn, scope) : null;
		ctx.fn = fn;
	} else if (update) {
		// Update rendered result
		run(injector, block, update, scope);
	}

	return ctx;
}
