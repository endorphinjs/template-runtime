import { add } from './injector';
import { invoked, obj } from './utils';

/**
 * Enters context of attributes modification
 * @param {Scope} scope
 */
export function beginAttributes(injector) {
	const { attributes } = injector;
	const attrs = obj();

	if (attributes) {
		// Mark previous attributes as removed in new attributes set
		for (const name in attributes) {
			if (attributes[name] != null) {
				attrs[name] = null;
			}
		}
	}

	injector.attributes = attrs;
}

// Various methods for better JIT optimizations

/**
 * @param {Injector} injector
 * @param {String} name
 * @param {*} value
 * @returns {function}
 */
export function renderAttribute(injector, name, value) {
	return invoked(() => setAttribute(injector, name, value));
}

/**
 * @param {Scope} scope
 * @param {Injector} injector
 * @param {String} name
 * @param {function} value
 * @returns {function}
 */
export function renderAttributeDynValue(scope, injector, name, value) {
	return invoked(() => setAttribute(injector, name, value(scope)));
}

/**
 * @param {Scope} scope
 * @param {Injector} injector
 * @param {function | string} name
 * @param {function | string} value
 * @returns {function}
 */
export function renderAttributeDyn(scope, injector, name, value) {
	return invoked(() => {
		const _name = typeof name === 'function' ? name(scope) : name;
		const _value = typeof value === 'function' ? value(scope) : value;
		setAttribute(injector, _name, _value);
	});
}

/**
 * Sets value of attribute `name` to `value`
 * @param {Injector} injector
 * @param {string} name
 * @param {*} value
 */
export function setAttribute(injector, name, value) {
	// Update attribute only if its value is defined
	if (name != null && value != null && value === value) {
		injector.attributes[name] = value;
	}
}

/**
 * Applied pending attributes changes to injector’s host element
 * @param {Injector} injector
 */
export function finalizeAttributes(injector) {
	const { parentNode, attributes } = injector;

	for (const name in attributes) {
		const value = attributes[name];
		if (value == null) {
			parentNode.removeAttribute(name);
		} else {
			parentNode.setAttribute(name, value);
		}
	}
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
