import { isDefined, finalizeItems } from './utils';

/**
 * Sets value of attribute `name` to `value`
 * @param {Injector} injector
 * @param {string} name
 * @param {*} value
 */
export function setAttribute(injector, name, value) {
	injector.attributes.cur[name] = value;
}

/**
 * Adds given class name as pending attribute
 * @param {Injector} injector
 * @param {string} value
 */
export function addClass(injector, value) {
	const className = injector.attributes.cur['class'];
	if (isDefined(value)) {
		value = normalizeClassName(isDefined(className) ? className + ' ' + value : value);
		setAttribute(injector, 'class', value);
	}
}

/**
 * Applies pending attributes changes to injector’s host element
 * @param {Injector} injector
 * @param {string[]} [staticAttrs]
 */
export function finalizeAttributes(injector, staticAttrs) {
	finalizeItems(injector.parentNode, injector.attributes, changeAttribute, staticAttrs);
}

/**
 * Normalizes given class value: removes duplicates and trims whitespace
 * @param {string} str
 * @returns {string}
 */
function normalizeClassName(str) {
	const out = [];
	const parts = String(str).split(/\s+/);

	for (let i = 0, cl; i < parts.length; i++) {
		cl = parts[i];
		if (cl && !out.includes(cl)) {
			out.push(cl);
		}
	}

	return out.join(' ');
}

/**
 * Callback for changing attribute value
 * @param {Element} elem
 * @param {string} name
 * @param {*} prevValue
 * @param {*} newValue
 */
function changeAttribute(elem, name, prevValue, newValue) {
	if (isDefined(newValue)) {
		elem.setAttribute(name, newValue);
	} else if (isDefined(prevValue)) {
		elem.removeAttribute(name);
	}
}