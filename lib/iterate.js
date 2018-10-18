import { block, run, dispose } from './injector';
import { enterScope, exitScope } from './scope';

/**
 * Mounts iterator block
 * @param {Scope} scope
 * @param {Injector} injector
 * @param {function} get A function that returns collection to iteratre
 * @param {function} body A function that renders item of iterated collection
 */
export function mountIterator(scope, injector, get, body) {
	const ctx = {
		scope,
		injector,
		get,
		block: block(injector),
		index: 0,
		rendered: [],
		iterator(value, key) {
			const { rendered, index } = ctx;

			enterScope(scope, { index, key, value });
			if (ctx.index < rendered.length) {
				// Update existing block
				run(injector, rendered[index][0], rendered[index][1], scope);
			} else {
				// Create & render new block
				const b = block(injector);
				const update = run(injector, b, body, scope);
				rendered.push([b, update]);
			}
			exitScope(scope);

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
	run(ctx.injector, ctx.block, iteratorHost, ctx.scope, ctx);
	return ctx;
}

function iteratorHost(scope, injector, ctx) {
	ctx.index = 0;
	const collection = ctx.get(scope);
	if (collection && typeof collection.forEach === 'function') {
		collection.forEach(ctx.iterator);
	}

	// Remove remaining blocks
	while (ctx.rendered.length > ctx.index) {
		dispose(injector, ctx.rendered.pop()[0], true);
	}
}
