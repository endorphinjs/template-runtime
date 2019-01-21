import { block, run, dispose } from './injector';
import { enterScope, exitScope, setScope, getScope } from './scope';
import { assign } from './utils';

/**
 * Mounts iterator block
 * @param {Comment} host
 * @param {Injector} injector
 * @param {function} get A function that returns collection to iterate
 * @param {function} body A function that renders item of iterated collection
 */
export function mountIterator(host, injector, get, body) {
	return updateIterator({
		host,
		injector,
		get,
		body,
		block: block(injector),
		index: 0,
		rendered: []
	});
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
	const collection = ctx.get(host, getScope(host));
	if (collection && typeof collection.forEach === 'function') {
		collection.forEach(iterator, ctx);
	}

	// Remove remaining blocks
	while (ctx.rendered.length > ctx.index) {
		dispose(injector, ctx.rendered.pop()[0], true);
	}
}

function iterator(value, key) {
	const { host, injector, rendered, index } = this;
	const localScope = { index, key, value };

	if (index < rendered.length) {
		// Update existing block
		const [b, update, scope] = rendered[index];
		setScope(host, assign(scope, localScope));
		run(injector, b, update, host, scope);
		exitScope(host);
	} else {
		// Create & render new block
		const b = block(injector);
		const scope = enterScope(host, localScope);
		const update = run(injector, b, this.body, host, scope);
		exitScope(host);
		rendered.push([b, update, scope]);
	}

	this.index++;
}
