import { block, run, move, dispose } from './injector';

/**
 * Renders key iterator block
 * @param {*} ctx
 * @param {Injector} injector
 * @param {Function} expr
 * @param {Function} keyExpr
 * @param {Function} body
 */
export default function renderKeyIterator(ctx, injector, expr, keyExpr, body) {
	let rendered = keyStore(), used;
	const hostBlock = block(injector);
	const host = ctx => {
		used = keyStore();

		const value = expr(ctx);
		if (value && typeof value.forEach === 'function') {
			value.forEach(iterator);
		}

		// Remove remaining blocks
		for (let k in rendered) {
			const items = rendered[k];
			while (items && items.length) {
				dispose(injector, items.pop()[0], true);
			}
		}

		rendered = used;
	};

	const iterator = item => {
		const key = keyExpr(item);
		const renderedData = key in rendered ? rendered[key].shift() : null;
		let b, update;

		if (renderedData) {
			// Update existing block
			[b, update] = renderedData;
			move(injector, b, injector.ptr);
			run(injector, b, update, item);
		} else {
			// Create & render new block
			b = block(injector);
			update = run(injector, b, body, item);
		}

		// Mark block as used.
		// We allow multiple items key in case of poorly prepared data.
		if (key in used) {
			used[key].push([b, update]);
		} else {
			used[key] = [[b, update]];
		}
	};

	const update = ctx => run(injector, hostBlock, host, ctx);

	update(ctx);
	return update;
}

function keyStore() {
	return Object.create(null);
}
