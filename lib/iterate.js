import { block, run, dispose } from './injector';
import { enterScope, exitScope } from './scope';

/**
 * Mounts iterator block
 * @param {Comment} host
 * @param {Injector} injector
 * @param {function} get A function that returns collection to iteratre
 * @param {function} body A function that renders item of iterated collection
 */
export function mountIterator(host, injector, get, body) {
	const ctx = {
		host,
		injector,
		get,
		block: block(injector),
		index: 0,
		rendered: [],
		iterator(value, key) {
			const { rendered, index } = ctx;

			enterScope(host, { index, key, value });
			if (ctx.index < rendered.length) {
				// Update existing block
				run(injector, rendered[index][0], rendered[index][1], host);
			} else {
				// Create & render new block
				const b = block(injector);
				const update = run(injector, b, body, host);
				rendered.push([b, update]);
			}
			exitScope(host);

			ctx.index++;
		}
	};

	return updateIterator(ctx);
}

/**
 * Updates iterator block defined in `ctx`
 * @param {object} ctx
 */
export function updateIterator(ctx) {
	run(ctx.injector, ctx.block, iteratorHost, ctx.host, ctx);
	return ctx;
}

function iteratorHost(host, injector, ctx) {
	ctx.index = 0;
	const collection = ctx.get(host);
	if (collection && typeof collection.forEach === 'function') {
		collection.forEach(ctx.iterator);
	}

	// Remove remaining blocks
	while (ctx.rendered.length > ctx.index) {
		dispose(injector, ctx.rendered.pop()[0], true);
	}
}
