export * from './lib/block';
export * from './lib/iterate';
export * from './lib/key-iterate';
export * from './lib/injector';
export * from './lib/scope';
export * from './lib/attribute';
export * from './lib/event';
export * from './lib/slot';
export * from './lib/ref';
export * from './lib/component';
export * from './lib/inner-html';
export * from './lib/dom';
export * from './lib/partial';

/**
 * Safe property getter
 * @param {*} ctx
 * @param {*} ...args
 * @returns {*}
 */
export function get(ctx) {
	const hasMap = typeof Map !== 'undefined';
	for (let i = 1, il = arguments.length, arg; ctx != null && i < il; i++) {
		arg = arguments[i];
		if (hasMap && ctx instanceof Map) {
			ctx = ctx.get(arg);
		} else {
			ctx = ctx[arg];
		}
	}

	return ctx;
}

/**
 * Filter items from given collection that matches `fn` criteria and returns
 * matched items
 * @param {Component} host
 * @param {Iterable} collection
 * @param {Function} fn
 * @returns {Array}
 */
export function filter(host, collection, fn) {
	const result = [];
	if (collection && collection.forEach) {
		collection.forEach((value, key) => {
			if (fn(host, value, key)) {
				result.push(value);
			}
		});
	}

	return result;
}
