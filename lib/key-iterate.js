import { block, run, move, dispose } from './injector';
import { enterScope, exitScope } from './scope';
import { obj, invoked } from './utils';

/**
 * Renders key iterator block
 * @param {Scope} scope
 * @param {Injector} injector
 * @param {Function} expr
 * @param {Function} keyExpr
 * @param {Function} body
 */
export default function renderKeyIterator(scope, injector, expr, keyExpr, body) {
	let rendered = obj(), used, index;
	const hostBlock = block(injector);
	const host = scope => {
		used = obj();
		index = 0;

		const collection = expr(scope);
		if (collection && typeof collection.forEach === 'function') {
			collection.forEach(iterator);
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

	const iterator = (value, key) => {
		const id = keyExpr(value);
		const renderedData = id in rendered ? rendered[id].shift() : null;
		let b, update;

		enterScope(scope, { index, key, value });
		if (renderedData) {
			// Update existing block
			[b, update] = renderedData;
			move(injector, b, injector.ptr);
			run(injector, b, update, scope);
		} else {
			// Create & render new block
			b = block(injector);
			update = run(injector, b, body, scope);
		}
		exitScope(scope);

		// Mark block as used.
		// We allow multiple items key in case of poorly prepared data.
		const entry = [b, update];
		if (id in used) {
			used[id].push(entry);
		} else {
			used[id] = [entry];
		}

		index++;
	};

	return invoked(() => run(injector, hostBlock, host, scope));
}
