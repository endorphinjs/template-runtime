import { block, run, move, dispose } from './injector';
import { enterScope, exitScope } from './scope';

/**
 * Renders key iterator block
 * @param {Scope} scope
 * @param {Injector} injector
 * @param {Function} expr
 * @param {Function} keyExpr
 * @param {Function} body
 */
export default function renderKeyIterator(scope, injector, expr, keyExpr, body) {
	let rendered = keyStore(), used, prevCollection, index;
	const hostBlock = block(injector);
	const host = scope => {
		used = keyStore();
		index = 0;

		const collection = expr(scope);
		if (prevCollection !== collection) {
			if (collection && typeof collection.forEach === 'function') {
				collection.forEach(iterator);
			}

			prevCollection = collection;

			// Remove remaining blocks
			for (let k in rendered) {
				const items = rendered[k];
				while (items && items.length) {
					dispose(injector, items.pop()[0], true);
				}
			}

			rendered = used;
		}
	};

	const iterator = (value, key) => {
		const id = keyExpr(value);
		const renderedData = id in rendered ? rendered[id].shift() : null;
		let b, update, prevValue, prevKey, prevIndex;

		if (renderedData) {
			// Update existing block
			[b, update, prevValue, prevKey, prevIndex] = renderedData;
			if (prevValue !== value || prevKey !== key || prevIndex !== index) {
				enterScope(scope, { index, key, value });
				move(injector, b, injector.ptr);
				run(injector, b, update, scope);
				exitScope(scope);
			}
		} else {
			// Create & render new block
			b = block(injector);
			enterScope(scope, { index, key, value });
			update = run(injector, b, body, scope);
			exitScope(scope);
		}

		// Mark block as used.
		// We allow multiple items key in case of poorly prepared data.
		const entry = [b, update, value, key, index];
		if (id in used) {
			used[id].push(entry);
		} else {
			used[id] = [entry];
		}

		index++;
	};

	const update = () => run(injector, hostBlock, host, scope);

	update();
	return update;
}

function keyStore() {
	return Object.create(null);
}
