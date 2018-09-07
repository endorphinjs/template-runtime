/**
 * Creates and renders block at given context
 * @param {Context} ctx
 * @param {Injector} injector
 * @param {Function} condition
 * @return {Function} A function that updates rendered result
 */
export default function renderBlock(ctx, injector, condition) {
	let cur, innerUpdate;
	const block = injector.block();

	const update = ctx => {
		injector.enter(block);

		const next = condition(ctx);
		if (cur !== next) {
			if (cur) {
				injector.dispose(false);
			}
			if (next) {
				innerUpdate = next(ctx, injector);
			}

			cur = next;
		} else if (innerUpdate) {
			innerUpdate(ctx);
		}

		injector.exit();
	};

	update(ctx);
	return update;
}
