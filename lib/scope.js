import { obj, assign } from './utils';

/**
 * Enters new variable scope context
 * @param {Component} elem
 * @param {object} incoming
 * @return {Object}
 */
export function enterScope(elem, incoming) {
	const { componentModel } = elem;
	return componentModel.vars = assign(obj(componentModel.vars), incoming);
}

/**
 * Exit from current variable scope
 * @param {Component} elem
 * @returns {Object}
 */
export function exitScope(elem) {
	const { componentModel } = elem;
	return componentModel.vars = Object.getPrototypeOf(componentModel.vars);
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
