export { default as renderBlock } from './lib/block';
export { default as renderIterator } from './lib/iterate';
export { default as renderKeyIterator } from './lib/key-iterate';
export * from './lib/injector';
export * from './lib/scope';
export * from './lib/attribute';
export * from './lib/event';
export * from './lib/slot';

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

/**
 * Adds given `scope` attribute to `el` to isolate its CSS
 * @param {HTMLElement} el
 * @param {String} scope
 * @returns {HTMLElement}
 */
export function cssScope(el, scope) {
	scope && el.setAttribute(scope, '');
	return el;
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
