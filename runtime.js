export { default as renderBlock } from './lib/block';
export * from './lib/injector';

/**
 * Creates element with given tag name
 * @param {String} tagName
 * @return {HTMLElement}
 */
export function elem(tagName) {
	return document.createElement(tagName);
}

/**
 * Creates element with given tag name and text
 * @param {String} tagName
 * @return {HTMLElement}
 */
export function elemWithText(tagName, text) {
	const elem = document.createElement(tagName);
	elem.textContent = text;
	return elem;
}

/**
 * Creates text node with given value
 * @param {String} value
 * @returns {Text}
 */
export function text(value) {
	return document.createTextNode(value);
}

/**
 * Empty, no-op function
 */
export function noop() {

}

/**
 * Safe property getter
 * @param {*} ctx
 * @param {*} ...args
 * @returns {*}
 */
export function get(ctx) {
	for (let i = 1, il = arguments.length, arg; ctx != null && i < il; i++) {
		arg = arguments[i];
		if (ctx instanceof Map) {
			ctx = ctx.get(arg);
		} else {
			ctx = ctx[arg];
		}
	}

	return ctx;
}
