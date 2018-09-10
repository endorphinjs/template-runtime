import { isInternalObject } from './utils';

/**
 * @typedef {Object} Injector
 * @property {Element} component Host scope component
 * @property {Object} vars Scope variables
 * @property {*} context Current context object
 * @property {Array} stack Stack of context objects
 */

const scopeKey = '&scope';

/**
 * Creates scope from given object, if required
 * @param {Element | Scope} component
 * @return {Scope}
 */
export function createScope(component) {
	if (isInternalObject(component)) {
		return component;
	}

	return {
		[scopeKey]: true,
		component,
		vars: {},
		context: component,
		stack: [component]
	};
}
