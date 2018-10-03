import { block, run, dispose } from './injector';
import { enterScope, exitScope } from './scope';
import { invoked } from './utils';

/**
 * Renders iterator block
 * @param {Scope} scope
 * @param {Injector} injector
 * @param {Function} expr
 * @param {Function} body
 */
export default function renderIterator(scope, injector, expr, body) {
	let index = 0;
	const rendered = [];
	const rootBlock = block(injector);
	const host = scope => {
		index = 0;
		const collection = expr(scope);
		if (collection && typeof collection.forEach === 'function') {
			collection.forEach(iterator);
		}

		// Remove remaining blocks
		while (rendered.length > index) {
			dispose(injector, rendered.pop()[0], true);
		}
	};

	const iterator = (value, key) => {
		enterScope(scope, { index, key, value });
		if (index < rendered.length) {
			// Update existing block
			const [b, update] = rendered[index];
			run(injector, b, update, scope);
		} else {
			// Create & render new block
			const b = block(injector);
			const update = run(injector, b, body, scope);
			rendered.push([b, update]);
		}
		exitScope(scope);

		index++;
	};

	return invoked(() => run(injector, rootBlock, host, scope));
}
