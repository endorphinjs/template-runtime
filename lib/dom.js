import { cssScope } from './utils';

/**
 * Creates element with given tag name
 * @param {String} tagName
 * @param {String} [scope] Attribute name for scoping CSS
 * @return {HTMLElement}
 */
export function elem(tagName, scope) {
	return cssScope(document.createElement(tagName), scope);
}

/**
 * Creates element with given tag name and text
 * @param {String} tagName
 * @param {String} text
 * @param {String} [scope] Attribute name for scoping CSS
 * @return {HTMLElement}
 */
export function elemWithText(tagName, text, scope) {
	const el = elem(tagName, scope);
	el.textContent = text;
	return el;
}

/**
 * Creates text node with given value
 * @param {String} value
 * @returns {Text}
 */
export function text(value) {
	return document.createTextNode(value);
}
