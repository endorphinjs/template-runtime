import { setScope, exitScope, enterScope, getScope } from './scope';
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
	// NB freeze scope context so all partial runtime objects  can be reused
	// across renders
	/** @type {PartialContext} */
	const ctx = {
		host,
		injector,
		block: block(injector),
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
	const { host, injector, block } = ctx;
	let updated = 0;

	if (ctx.partial !== partial) {
		// Unmount previously rendered partial
		ctx.partial && dispose(injector, block, getScope(host), false);

		// Mount new partial
		const scope = ctx.scope = enterScope(host, assign(obj(partial.defaults), args));
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
