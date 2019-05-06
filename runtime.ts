import { Component } from './types';

export * from './src/block';
export * from './src/iterate';
export * from './src/key-iterate';
export * from './src/injector';
export * from './src/scope';
export * from './src/attribute';
export * from './src/event';
export * from './src/slot';
export * from './src/ref';
export * from './src/component';
export * from './src/inner-html';
export * from './src/dom';
export * from './src/partial';
export * from './src/store';
export * from './src/animation';
export { addDisposeCallback, assign } from './src/utils';

/**
 * Safe property getter
 * @param {*} ctx
 * @param {*} ...args
 * @returns {*}
 */
export function get(ctx: any): any {
	const hasMap = typeof Map !== 'undefined';
	for (let i = 1, il = arguments.length, arg: any; ctx != null && i < il; i++) {
		arg = arguments[i];
		if (hasMap && ctx instanceof Map) {
			ctx = ctx.get(arg);
		} else {
			ctx = ctx[arg];
		}
	}

	return ctx;
}

type FilterCallback<T> = (host: Component, value: T, key: string | number) => boolean;

/**
 * Filter items from given collection that matches `fn` criteria and returns
 * matched items
 */
export function filter<T>(host: Component, collection: T[], fn: FilterCallback<T>): T[] {
	const result: T[] = [];
	if (collection && collection.forEach) {
		collection.forEach((value, key) => {
			if (fn(host, value, key)) {
				result.push(value);
			}
		});
	}

	return result;
}

/**
 * Invokes `methodName` of `ctx` object with given args
 */
export function call(ctx: any, methodName: string, args?: any[]) {
	const method = ctx != null && ctx[methodName];
	if (typeof method === 'function') {
		return args ? method.apply(ctx, args) : method.call(ctx);
	}
}
