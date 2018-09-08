/**
 * Renders iterator block
 * @param {*} ctx
 * @param {Injector} injector
 * @param {Function} expr
 * @param {Function} body
 */
export default function renderIterator(ctx, injector, expr, body) {
	const rendered = [];
	const rootBlock = injector.block();
	const update = ctx => {
		injector.enter(rootBlock);

		let ptr = 0;
		const value = expr(ctx);
		if (value && typeof value.forEach === 'function') {
			value.forEach(item => {
				if (ptr < rendered.length) {
					// Update existing block
					const [block, update] = rendered[ptr][1];
					if (typeof update === 'function') {
						injector.enter(block);
						update(item);
						injector.exit();
					}
				} else {
					// Create & render new block
					const block = injector.block();
					injector.enter(block);
					const update = body(item, injector);
					injector.exit();
					rendered.push([block, update]);
				}

				ptr++;
			});
		}

		// Remove remaining blocks
		while (rendered.length > ptr) {
			injector.remove(rendered.pop()[0]);
		}

		injector.exit();
	};

	update(ctx);
	return update;
}
