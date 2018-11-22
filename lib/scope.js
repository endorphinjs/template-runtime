import { obj, assign } from './utils';

/**
 * Enters new variable scope context
 * @param {Component} component
 * @param {object} incoming
 * @return {Component}
 */
export function enterScope(component, incoming) {
	component.vars = assign(obj(component.vars), incoming);
	return component;
}

/**
 * Exit from current variable scope
 * @param {Component} component
 * @returns {Component}
 */
export function exitScope(component) {
	component.vars = Object.getPrototypeOf(component.vars);
	return component;
}

/**
 * Returns property with given name from component
 * @param {Component} component
 * @param {string} name
 * @return {*}
 */
export function getProp(component, name) {
	return component.element.props[name];
}

/**
 * Returns state value with given name from component
 * @param {Component} component
 * @param {string} name
 * @return {*}
 */
export function getState(component, name) {
	return component.element.state[name];
}

/**
 * Returns value of given runtime variable from component
 * @param {Component} component
 * @param {string} name
 * @returns {*}
 */
export function getVar(component, name) {
	return component.vars[name];
}

/**
 * Sets value of given runtime variable for component
 * @param {Component} component
 * @param {string} name
 * @param {*} value
 */
export function setVar(component, name, value) {
	component.vars[name] = value;
}
