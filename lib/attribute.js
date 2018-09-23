import { isDefined } from './utils';

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
	setAttribute(injector, 'class', isDefined(className) ? `${className} ${value}` : value);
}

/**
 * Applied pending attributes changes to injector’s host element
 * @param {Injector} injector
 * @param {string[]} [staticAttrs]
 */
export function finalizeAttributes(injector, staticAttrs) {
	const { parentNode, attributes: { cur, prev } } = injector;

	for (const name in cur) {
		// Add updated attributes
		let value = cur[name];
		const prevValue = prev[name];

		if (name === 'class' && isDefined(value)) {
			value = normalizeClassName(value);
		}

		if (value !== prevValue) {
			if (isDefined(value)) {
				parentNode.setAttribute(name, value);
			} else if (isDefined(prevValue)) {
				parentNode.removeAttribute(name);
			}

			prev[name] = value;
			cur[name] = null;
		}
	}

	// Remove static attributes from further change set
	if (staticAttrs) {
		for (let i = 0; i < staticAttrs.length; i++) {
			delete cur[staticAttrs[i]];
		}
	}
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
