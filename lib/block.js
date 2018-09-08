import { enter, exit, block, dispose } from './injector';

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

			if (next) {
				enter(injector, b);
				innerUpdate = next(ctx, injector);
				exit(injector);
			}

			cur = next;
		} else if (innerUpdate) {
			enter(injector, b);
			innerUpdate(ctx);
			exit(injector);
		}
	};

	update(ctx);
	return update;
}
