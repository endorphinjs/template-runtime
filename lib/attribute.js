import { add } from '../runtime';
import { invoked } from './utils';

/**
 * Sets value of attribute `name` to value returned by `query` function
 * @param {Scope} scope
 * @param {Element} elem
 * @param {string} name
 * @param {Function} expr
 */
export function setAttribute(scope, elem, name, expr) {
	let lastValue;
	return invoked(() => {
		const value = expr(scope);
		if (value !== lastValue) {
			elem.setAttribute(name, lastValue = value);
		}
	});
}

/**
 * Renders `add class` instruction
 * @param {Scope} scope
 * @param {Injector} injector
 * @param {Function} expr
 */
export function renderAddClass(scope, injector, expr) {
	let lastValue;
	add(injector, () => {
		if (lastValue != null) {
			injector.parentNode.classList.remove(lastValue);
		}
	});

	return invoked(() => {
		const value = expr(scope);
		if (value !== lastValue) {
			const { parentNode } = injector;
			if (lastValue != null) {
				parentNode.classList.remove(lastValue);
			}

			if (value != null) {
				parentNode.classList.add(value);
			}

			lastValue = value;
		}
	});
}

/**
 * Renders `add attribute` instruction
 * @param {Scope} scope
 * @param {Injector} injector
 * @param {string} name
 * @param {Function} expr
 * @param {Function} original
 */
export function renderAddAttribute(scope, injector, name, expr, original) {
	let lastValue;
	add(injector, () => setAttr(injector, name, original(scope)));

	return invoked(() => {
		const value = expr(scope);
		if (value !== lastValue) {
			setAttr(injector, name, lastValue = value);
		}
	});
}

function setAttr(injector, name, value) {
	const { parentNode } = injector;

	if (value == null) {
		parentNode.removeAttribute(name);
	} else {
		parentNode.setAttribute(name, value);
	}
}
