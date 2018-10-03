import { run, block, dispose } from './injector';
import { invoked } from './utils';

/**
 * Creates and renders block at given context
 * @param {Scope} scope
 * @param {Injector} injector
 * @param {Function} condition
 * @return {Function} A function that updates rendered result
 */
export default function renderBlock(scope, injector, condition) {
	let cur, innerUpdate;
	const b = block(injector);

	return invoked(() => {
		const next = condition(scope);
		if (cur !== next) {
			// Unmount previously rendered content
			cur && dispose(injector, b, false);

			// Mount new block content
			innerUpdate = next ? run(injector, b, next, scope) : null;
			cur = next;
		} else if (innerUpdate) {
			// Update rendered result
			run(injector, b, innerUpdate, scope);
		}
	});
}
