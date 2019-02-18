import { obj, assign } from './utils';

/**
 * Enters new variable scope context
 * @param {Component} host
 * @param {object} incoming
 * @return {Object}
 */
export function enterScope(host, incoming) {
	return setScope(host, createScope(host, incoming));
}

/**
 * Exit from current variable scope
 * @param {Component} host
 * @returns {Object}
 */
export function exitScope(host) {
	return setScope(host, Object.getPrototypeOf(host.componentModel.vars));
}

/**
 * Creates new scope from given component state
 * @param {Component} host
 * @param {Object} [incoming]
 * @return {Object}
 */
export function createScope(host, incoming) {
	return assign(obj(host.componentModel.vars), incoming);
}

/**
 * Sets given object as current component scope
 * @param {Component} host
 * @param {Object} scope
 */
export function setScope(host, scope) {
	return host.componentModel.vars = scope;
}

/**
 * Returns current variable scope
 * @param {Component} elem
 * @returns {object}
 */
export function getScope(elem) {
	return elem.componentModel.vars;
}

/**
 * Returns property with given name from component
 * @param {Component} elem
 * @param {string} name
 * @return {*}
 */
export function getProp(elem, name) {
	return elem.props[name];
}

/**
 * Returns state value with given name from component
 * @param {Component} elem
 * @param {string} name
 * @return {*}
 */
export function getState(elem, name) {
	return elem.state[name];
}

/**
 * Returns value of given runtime variable from component
 * @param {Component} elem
 * @param {string} name
 * @returns {*}
 */
export function getVar(elem, name) {
	return elem.componentModel.vars[name];
}

/**
 * Sets value of given runtime variable for component
 * @param {Component} elem
 * @param {string} name
 * @param {*} value
 */
export function setVar(elem, name, value) {
	elem.componentModel.vars[name] = value;
}
