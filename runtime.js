import createInjector from './lib/injector';

/**
 * Creates and renders block at given context
 * @param {Context} ctx
 * @param {Injector} injector
 * @param {Function} condition
 * @return {Function} A function that updates rendered result
 */
export function renderBlock(ctx, injector, condition) {
	let cur, innerUpdate;
	const block = injector.block();

	const update = ctx => {
		injector.enter(block);

		const next = condition(ctx);
		if (cur !== next) {
			if (cur) {
				injector.dispose();
			}
			if (next) {
				innerUpdate = next(ctx, injector);
			}

			cur = next;
		} else if (innerUpdate) {
			innerUpdate(ctx);
		}

		injector.exit();
	};

	update(ctx);
	return update;
}

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

export { createInjector };
