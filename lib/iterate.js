import { block, run, dispose } from './injector';
import { enterScope, exitScope } from './scope';

/**
 * Renders iterator block
 * @param {Scope} scope
 * @param {Injector} injector
 * @param {Function} expr
 * @param {Function} body
 */
export default function renderIterator(scope, injector, expr, body) {
	let index = 0, prevCollection;
	const rendered = [];
	const rootBlock = block(injector);
	const host = scope => {
		index = 0;
		const collection = expr(scope);
		if (prevCollection !== collection) {
			if (collection && typeof collection.forEach === 'function') {
				collection.forEach(iterator);
				prevCollection = collection;
			}

			// Remove remaining blocks
			while (rendered.length > index) {
				dispose(injector, rendered.pop()[0], true);
			}
		}
	};

	const iterator = (value, key) => {
		if (index < rendered.length) {
			// Update existing block
			const renderedData = rendered[index];
			const [b, update, prevValue, prevKey, prevIndex] = renderedData;
			if (prevValue !== value || prevKey !== key || prevIndex !== index) {
				enterScope(scope, { index, key, value });
				run(injector, b, update, scope);
				exitScope(scope);
				renderedData[2] = value;
				renderedData[3] = key;
				renderedData[4] = index;
			}
		} else {
			// Create & render new block
			const b = block(injector);
			enterScope(scope, { index, key, value });
			const update = run(injector, b, body, scope);
			exitScope(scope);
			rendered.push([b, update, value, key, index]);
		}

		index++;
	};

	const update = () => run(injector, rootBlock, host, scope);

	update();
	return update;
}
