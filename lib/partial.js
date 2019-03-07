import { setScope, exitScope, getScope } from './scope';
import { assign, obj } from './utils';
import { block, dispose, run } from './injector';

/**
 * Mounts given partial into injector context
 * @param {Component} host
 * @param {Injector} injector
 * @param {Object} partial
 * @param {Object} args
 * @return {PartialContext}
 */
export function mountPartial(host, injector, partial, args) {
	/** @type {PartialContext} */
	const ctx = {
		host,
		injector,
		block: block(injector),
		baseScope: getScope(host),
		scope: null,
		update: null,
		partial: null
	};
	updatePartial(ctx, partial, args);
	return ctx;
}

/**
 * Updates mounted partial
 * @param {PartialContext} ctx
 * @param {Object} partial
 * @param {Object} args
 * @returns {number} Returns `1` if partial was updated, `0` otherwise
 */
export function updatePartial(ctx, partial, args) {
	const { host, injector, block, baseScope } = ctx;
	let updated = 0;

	if (ctx.partial !== partial) {
		// Unmount previously rendered partial
		ctx.partial && dispose(injector, block, ctx.scope, false);

		// Mount new partial
		const scope = ctx.scope = assign(obj(baseScope), partial.defaults, args);
		setScope(host, scope);
		ctx.update = partial ? run(injector, block, partial.body, host, scope) : null;
		ctx.partial = partial;
		exitScope(host);
		updated = 1;
	} else if (ctx.update) {
		// Update rendered partial
		setScope(host, assign(ctx.scope, args));
		if (run(injector, block, ctx.update, host, ctx.scope)) {
			updated = 1;
		}
		exitScope(host);
	}

	return updated;
}

/**
 * @param {PartialContext} ctx
 */
export function unmountPartial(ctx) {
	dispose(ctx.injector, ctx.block, ctx.scope, true);
}
