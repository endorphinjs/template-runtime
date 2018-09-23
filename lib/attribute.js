import { invoked, obj, isDefined } from './utils';

/**
 * Enters context of attributes modification
 * @param {Scope} scope
 * @return {object}
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

	return injector.attributes = attrs;
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
 * @param {Injector} injector
 * @param {string} value
 * @returns {function}
 */
export function renderAddClass(injector, value) {
	return invoked(() => addClass(injector, value));
}

/**
 * @param {Scope} scope
 * @param {Injector} injector
 * @param {function} value
 * @returns {function}
 */
export function renderAddClassDyn(scope, injector, value) {
	return invoked(() => addClass(injector, value(scope)));
}

/**
 * Sets value of attribute `name` to `value`
 * @param {Injector} injector
 * @param {string} name
 * @param {*} value
 */
export function setAttribute(injector, name, value) {
	injector.attributes[name] = value;
}

/**
 * Adds given class name as pending attribute
 * @param {Injector} injector
 * @param {string} value
 */
export function addClass(injector, value) {
	const { attributes } = injector;
	let className = attributes['class'];

	if (isDefined(className)) {
		className += ` ${value}`;
	} else {
		className = value;
	}

	attributes['class'] = className;
}

/**
 * Applied pending attributes changes to injector’s host element
 * @param {Injector} injector
 */
export function finalizeAttributes(injector) {
	const { parentNode, attributes } = injector;

	for (const name in attributes) {
		const value = attributes[name];

		if (name === 'class') {
			parentNode.className = isDefined(value) ? normalizeClassName(value) : '';
		} else if (isDefined(value)) {
			parentNode.setAttribute(name, value);
		} else {
			parentNode.removeAttribute(name);
		}
	}
}

/**
 * Normalizes given class value: removes duplicates and trims whitespace
 * @param {string} str
 * @returns {string}
 */
function normalizeClassName(str) {
	const lookup = {}, out = [];
	const parts = String(str).split(/\s+/);

	for (let i = 0, cl; i < parts.length; i++) {
		cl = parts[i];
		if (cl && !(cl in lookup)) {
			lookup[cl] = true;
			out.push(cl);
		}
	}

	return out.join(' ');
}
