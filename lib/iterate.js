import { block, run, dispose } from './injector';

/**
 * Renders iterator block
 * @param {*} ctx
 * @param {Injector} injector
 * @param {Function} expr
 * @param {Function} body
 */
export default function renderIterator(ctx, injector, expr, body) {
	let ptr = 0;
	const rendered = [];
	const rootBlock = block(injector);
	const host = ctx => {
		ptr = 0;
		const value = expr(ctx);
		if (value && typeof value.forEach === 'function') {
			value.forEach(iterator);
		}

		// Remove remaining blocks
		while (rendered.length > ptr) {
			dispose(injector, rendered.pop()[0], true);
		}
	};

	const iterator = item => {
		if (ptr < rendered.length) {
			// Update existing block
			const [b, update] = rendered[ptr];
			if (typeof update === 'function') {
				run(injector, b, update, item);
			}
		} else {
			// Create & render new block
			const b = block(injector);
			const update = run(injector, b, body, item);
			rendered.push([b, update]);
		}

		ptr++;
	};

	const update = ctx => run(injector, rootBlock, host, ctx);

	update(ctx);
	return update;
}
