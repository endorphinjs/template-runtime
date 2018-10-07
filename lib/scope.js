import { obj } from './utils';

/**
 * @typedef {Object} Scope
 * @property {Element} component Host scope component
 * @property {object} slots Incoming slot data
 * @property {Object} vars Scope variables
 * @property {Array} stack Stack of scope variables
 */

/**
 * Creates scope from given object, if required
 * @param {Element | Scope} component
 * @return {Scope}
 */
export function createScope(component, slots) {
	return {
		component,
		slots,
		vars: obj(),
		stack: []
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
	scope.vars = Object.assign(Object.create(scope.vars), vars);
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
	return scope.component.props[name];
}

/**
 * Returns state value with given name from scope
 * @param {Scope} scope
 * @param {string} name
 * @return {*}
 */
export function getState(scope, name) {
	const { component } = scope;
	if (component.state) {
		return component.state.get()[name];
	}
}

/**
 * Sets state value with given name
 * @param {Scope} scope
 * @param {string} name
 * @param {*} value
 */
export function setState(scope, name, value) {
	const { component } = scope;
	if (component.state) {
		component.state.set({ [name]: value });
	}
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
