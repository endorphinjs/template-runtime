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
	const b = block(injector, 'section');

	return invoked(() => {
		const next = condition(scope);
		if (cur !== next) {
			if (cur) {
				dispose(injector, b, false);
			}

			innerUpdate = next ? run(injector, b, next, scope) : null;
			cur = next;
		} else if (innerUpdate) {
			run(injector, b, innerUpdate, scope);
		}
	});
}
