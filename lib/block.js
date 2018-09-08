import { run, block, dispose } from './injector';

/**
 * Creates and renders block at given context
 * @param {Context} ctx
 * @param {Injector} injector
 * @param {Function} condition
 * @return {Function} A function that updates rendered result
 */
export default function renderBlock(ctx, injector, condition) {
	let cur, innerUpdate;
	const b = block(injector);

	const update = ctx => {
		const next = condition(ctx);
		if (cur !== next) {
			if (cur) {
				dispose(injector, b, false);
			}

			innerUpdate = next ? run(injector, b, next, ctx) : null;
			cur = next;
		} else if (innerUpdate) {
			run(injector, b, innerUpdate, ctx);
		}
	};

	update(ctx);
	return update;
}
