import { finalizeItems } from './utils';

/**
 * Sets runtime ref (e.g. ref which will be changed over time) to given host
 * @param {Component} host
 * @param {string} name
 * @param {HTMLElement} elem
 */
export function setRef(host, name, elem) {
	host.componentModel.refs.cur[name] = elem;
}

/**
 * Sets static ref (e.g. ref which won’t be changed over time) to given host
 * @param {Component} host
 * @param {string} name
 * @param {Element} value
 */
export function setStaticRef(host, name, value) {
	value && value.setAttribute(getRefAttr(name, host), '');
	host.refs[name] = value;
}

/**
 * Finalizes refs on given scope
 * @param {Component} host
 * @returns {boolean} Update status
 */
export function finalizeRefs(host) {
	return finalizeItems(host.componentModel.refs, changeRef, host);
}

/**
 * Invoked when element reference was changed
 * @param {string} name
 * @param {Element} prevValue
 * @param {Element} newValue
 * @param {Component} host
 */
function changeRef(name, prevValue, newValue, host) {
	prevValue && prevValue.removeAttribute(getRefAttr(name, host));
	setStaticRef(host, name, newValue);
}

/**
 * Returns attribute name to identify element in CSS
 * @param {String} name
 * @param {Component} host
 */
function getRefAttr(name, host) {
	const cssScope = host.componentModel.definition.cssScope;
	return 'ref-' + name + (cssScope ? '-' + cssScope : '');
}
