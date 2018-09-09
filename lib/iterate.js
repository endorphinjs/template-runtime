import { block, run, dispose } from './injector';

/**
 * Renders iterator block
 * @param {*} ctx
 * @param {Injector} injector
 * @param {Function} expr
 * @param {Function} body
 */
export default function renderIterator(ctx, injector, expr, body) {
	let ptr = 0, prevValue;
	const rendered = [];
	const rootBlock = block(injector);
	const host = ctx => {
		ptr = 0;
		const value = expr(ctx);
		if (prevValue !== value) {
			if (value && typeof value.forEach === 'function') {
				value.forEach(iterator);
				prevValue = value;
			}

			// Remove remaining blocks
			while (rendered.length > ptr) {
				dispose(injector, rendered.pop()[0], true);
			}
		}
	};

	const iterator = item => {
		if (ptr < rendered.length) {
			// Update existing block
			const [b, update, prevItem] = rendered[ptr];
			if (prevItem !== item) {
				run(injector, b, update, item);
				rendered[ptr][2] = item;
			}
		} else {
			// Create & render new block
			const b = block(injector);
			const update = run(injector, b, body, item);
			rendered.push([b, update, item]);
		}

		ptr++;
	};

	const update = ctx => run(injector, rootBlock, host, ctx);

	update(ctx);
	return update;
}
