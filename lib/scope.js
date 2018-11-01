import { obj, changeSet, assign } from './utils';

/**
 * @typedef {object} Scope
 * @property {ComponentContainer} component Host scope component
 * @property {object} vars Scope variables
 * @property {object[]} stack Stack of scope variables
 * @property {object} refs Pending refs
 * @property {String} css Unique component identifier for scoping CSS styles
 */

/**
 * Creates scope from given object, if required
* @param {ComponentModel} element
* @param {ComponentDefinition} definition
 * @return {Scope}
 */
export function createScope(element, definition) {
	return {
		element,
		definition,
		vars: obj(),
		stack: [],
		refs: changeSet(),
		css: definition.cssScope
	};
}

/**
 * Enters new scope context
 * @param {Scope} scope
 * @param {Object} vars
 * @return {Scope}
 */
export function enterScope(scope, vars) {
	scope.stack.push(scope.vars);
	scope.vars = assign(obj(scope.vars), vars);
	return scope;
}

/**
 * Exit from current variable scope
 * @param {Scope} scope
 * @returns {Scope}
 */
export function exitScope(scope) {
	scope.vars = scope.stack.pop();
	return scope;
}

/**
 * Returns property with given name from scope
 * @param {Scope} scope
 * @param {string} name
 * @return {*}
 */
export function getProp(scope, name) {
	return scope.element.props[name];
}

/**
 * Returns state value with given name from scope
 * @param {Scope} scope
 * @param {string} name
 * @return {*}
 */
export function getState(scope, name) {
	return scope.element.state[name];
}

/**
 * Returns value of given runtime variable from scope
 * @param {Scope} scope
 * @param {string} name
 * @returns {*}
 */
export function getVar(scope, name) {
	return scope.vars[name];
}

/**
 * Sets value of given runtime variable
 * @param {Scope} scope
 * @param {string} name
 * @param {*} value
 */
export function setVar(scope, name, value) {
	scope.vars[name] = value;
}
