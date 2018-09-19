import { add } from './injector';
import { invoked, obj } from './utils';

/**
 * Enters context of attributes modification
 * @param {Scope} scope
 */
export function beginAttributes(injector) {
	const { attributes } = injector;

	injector.attributes = {
		cur: obj(),
		prev: attributes ? attributes.prev : obj()
	};
}

// Variuos methods for better JIT optimizations

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
	// Update attribute only if its value is non-null or NaN
	if (name != null && value != null && value === value) {
		injector.attributes.cur[name] = value;
	}
}

export function finalizeAttributes(injector) {
	const { attributes: { cur, prev } } = injector;
	let changes = cur;

	if (prev) {
		// Mark missing attributes as removed
		changes = Object.assign(obj(), changes);
		for (const name in prev) {
			if (!(name in cur)) {
				changes[name] = null;
			}
		}
	}

	applyArributes(injector.parentNode, changes);
}

/**
 * Apply changed attributes to given element
 * @param {Element} elem
 * @param {Object} changes
 */
function applyArributes(elem, changes) {
	for (const name in changes) {
		const value = changes[name];
		// null, undefined or NaN should remove attribute
		if (value == null || value !== value) {
			elem.removeAttribute(name);
		} else {
			elem.setAttribute(name, value);
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
