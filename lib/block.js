/**
 * 
 * @param {Function} condition 
 * @param {*} ctx 
 * @param {Injector} injector 
 */
export default function renderBlock(condition, ctx, injector) {
	let cur, output;
	const update = ctx => {
		const next = condition(ctx);
		if (cur !== next) {
			if (cur) {
				injector.dispose();
			}
			if (next) {
				output = next(ctx, injector);
			}

			cur = next;
		} else if (output) {
			output(ctx);
		}
	};

	update(ctx);

	return update;
}