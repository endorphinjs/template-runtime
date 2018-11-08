import { cssScope } from './utils';

/**
 * Creates element with given tag name
 * @param {string} tagName
 * @param {Component} [host] Host component for style scoping
 * @return {HTMLElement}
 */
export function elem(tagName, host) {
	return cssScope(document.createElement(tagName), host);
}

/**
 * Creates element with given tag name and text
 * @param {string} tagName
 * @param {string} text
 * @param {Component} [host] Host component for style scoping
 * @return {HTMLElement}
 */
export function elemWithText(tagName, text, host) {
	const el = elem(tagName, host);
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
