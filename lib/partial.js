import { setScope, getScope } from './scope';
import { assign, obj } from './utils';
import { run, injectBlock, emptyBlockContent, disposeBlock } from './injector';

/**
 * Mounts given partial into injector context
 * @param {Component} host
 * @param {Injector} injector
 * @param {PartialDefinition} partial
 * @param {Object} args
 * @return {PartialBlock}
 */
export function mountPartial(host, injector, partial, args) {
	/** @type {PartialBlock} */
	const block = injectBlock(injector, {
		$$block: true,
		host,
		injector,
		scope: getScope(host),
		dispose: null,
		update: null,
		partial: null,
		start: null,
		end: null
	});
	updatePartial(block, partial, args);
	return block;
}

/**
 * Updates mounted partial
 * @param {PartialBlock} ctx
 * @param {PartialDefinition} partial
 * @param {Object} args
 * @returns {number} Returns `1` if partial was updated, `0` otherwise
 */
export function updatePartial(ctx, partial, args) {
	const host = partial.host || ctx.host;
	const { injector } = ctx;
	const prevHost = ctx.host;
	const prevScope = getScope(host);
	let updated = 0;

	ctx.host = host;

	if (ctx.partial !== partial) {
		// Unmount previously rendered partial
		ctx.partial && emptyBlockContent(ctx);

		// Mount new partial
		const scope = ctx.scope = assign(obj(prevScope), partial.defaults, args);
		setScope(host, scope);
		ctx.update = partial ? run(ctx, partial.body, scope) : null;
		ctx.partial = partial;
		setScope(host, prevScope);
		updated = 1;
	} else if (ctx.update) {
		// Update rendered partial
		const scope = setScope(host, assign(ctx.scope, args));
		if (run(ctx, ctx.update, scope)) {
			updated = 1;
		}
		setScope(host, prevScope);
	}

	ctx.host = prevHost;
	injector.ptr = ctx.end;

	return updated;
}

/**
 * @param {PartialBlock} ctx
 */
export function unmountPartial(ctx) {
	disposeBlock(ctx);
}
