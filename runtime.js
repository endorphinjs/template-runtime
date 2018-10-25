export * from './lib/block';
export * from './lib/iterate';
export * from './lib/key-iterate';
export * from './lib/injector';
export * from './lib/scope';
export * from './lib/attribute';
export * from './lib/event';
export * from './lib/slot';
export * from './lib/ref';
export * from './lib/inner-html';
export * from './lib/dom';

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
