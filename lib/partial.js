import { createScope, setScope, exitScope } from './scope';
import { assign } from './utils';
import { block, dispose, run } from './injector';

/**
 * Mounts given partial into injector context
 * @param {Component} host
 * @param {Injector} injector
 * @param {Object} partial
 * @param {Object} args
 */
export function mountPartial(host, injector, partial, args) {
	// NB freeze scope context so all partial runtime objects  can be reused
	// across renders
	return updatePartial({
		host,
		injector,
		block: block(injector),
		scope: createScope(host),
		update: null,
		partial: null
	}, partial, args);
}

/**
 * Updates mounted partial
 * @param {Object} ctx
 * @param {Object} partial
 * @param {Object} args
 * @return {Object}
 */
export function updatePartial(ctx, partial, args) {
	const { host, injector, scope, block } = ctx;

	if (ctx.partial !== partial) {
		// Unmount previously rendered partial
		ctx.partial && dispose(injector, block, false);

		// Mount new partial
		setScope(host, assign(scope, partial.defaults, args));
		ctx.update = partial ? run(injector, block, partial.body, host, scope) : null;
		ctx.partial = partial;
		exitScope(host);
	} else if (ctx.update) {
		// Update rendered partial
		setScope(host, assign(scope, partial.defaults, args));
		run(injector, block, ctx.update, host, scope);
		exitScope(host);
	}

	return ctx;
}
