import { Component, Injector, Changes, ChangeSet, UnmountBlock } from '../types';

export const animatingKey = '$$animating';

type ChangeCallback = (name: string, prev: any, next: any, ctx?: any) => void;

/**
 * Creates fast object
 */
export function obj(proto: object = null): {} {
	return Object.create(proto);
}

/**
 * Check if given value id defined, e.g. not `null`, `undefined` or `NaN`
 * @param {*} value
 * @returns {boolean}
 */
export function isDefined(value: any): boolean {
	return value != null && value === value;
}

/**
 * Finalizes updated items, defined in `items.prev` and `items.cur`
 * @param {object} items
 * @param {function} change
 * @param {*} [ctx]
 * @returns {number} Returns `1` if data was updated, `0` otherwise
 */
export function finalizeItems(items: ChangeSet, change: ChangeCallback, ctx: any): number {
	let updated = 0;
	const { cur, prev } = items;

	for (const name in cur) {
		const curValue = cur[name];
		const prevValue = prev[name];
		if (curValue !== prevValue) {
			updated = 1;
			change(name, prevValue, prev[name] = curValue, ctx);
		}
		cur[name] = null;
	}

	return updated;
}

/**
 * Creates object for storing change sets, e.g. current and previous values
 */
export function changeSet(): ChangeSet {
	return { prev: obj(), cur: obj() };
}

/**
 * Returns properties from `next` which were changed since `prev` state.
 * Returns `null` if there are no changes
 */
export function changed(next: any, prev: any, prefix = ''): Changes {
	const result: Changes = obj();
	let dirty = false;

	// Check if data was actually changed
	for (const p in next) {
		if (prev[p] !== next[p]) {
			dirty = true;
			result[prefix ? prefix + p : p] = {
				prev: prev[p],
				current: next[p]
			};
		}
	}

	return dirty ? result : null;
}

/**
 * Moves contents of given `from` element into `to` element
 * @returns The `to` element
 */
export function moveContents(from: Element | DocumentFragment, to: Element): Element {
	if (from !== to) {
		if (from.nodeType === from.DOCUMENT_FRAGMENT_NODE) {
			to.appendChild(from);
		} else {
			let node: Node;
			while (node = from.firstChild) {
				to.appendChild(node);
			}
		}
	}

	return to;
}

/**
 * Adds given `scope` attribute to `el` to isolate its CSS
 */
export function cssScope(el: HTMLElement, host?: Component): HTMLElement {
	const scope = host && host.componentModel && host.componentModel.definition.cssScope;
	scope && el.setAttribute(scope, '');
	return el;
}

/**
 * Queues given `fn` function to be invoked asynchronously as soon as possible
 */
export function nextTick(fn: (value: void) => void): Promise<any> {
	return Promise.resolve().then(fn);
}

// tslint:disable-next-line:only-arrow-functions
const assign = Object.assign || function(target: any) {
	for (let i = 1, source: any; i < arguments.length; i++) {
		source = arguments[i];

		for (const p in source) {
			if (source.hasOwnProperty(p)) {
				target[p] = source[p];
			}
		}
	}

	return target;
};

/**
 * Returns property descriptors from given object
 */
// tslint:disable-next-line:only-arrow-functions
const getObjectDescriptors = Object['getOwnPropertyDescriptors'] || function(source: any) {
	const descriptors = obj();
	const props = Object.getOwnPropertyNames(source);

	for (let i = 0, prop: string, descriptor: PropertyDescriptor; i < props.length; i++) {
		prop = props[i];
		descriptor = Object.getOwnPropertyDescriptor(source, prop);
		if (descriptor != null) {
			descriptors[prop] = descriptor;
		}
	}

	return descriptors;
};

export { assign, getObjectDescriptors };

/**
 * Assign data from `next` to `prev` if there are any updates
 * @return Returns `true` if data was assigned
 */
export function assignIfNeeded(prev: any, next: any): boolean {
	for (const p in next) {
		if (next.hasOwnProperty(p) && prev[p] !== next[p]) {
			return assign(prev, next);
		}
	}
}

/**
 * Represents given attribute value in element
 * @param {Element} elem
 * @param {string} name
 * @param {*} value
 */
export function representAttributeValue(elem: Element, name: string, value: any) {
	const type = typeof(value);

	if (type === 'boolean') {
		value = value ? '' : null;
	} else if (type === 'function') {
		value = '𝑓';
	} else if (Array.isArray(value)) {
		value = '[]';
	} else if (isDefined(value) && type === 'object') {
		value = '{}';
	}

	isDefined(value) ? elem.setAttribute(name, value) : elem.removeAttribute(name);
}

/**
 * Marks given item as explicitly disposable for given host
 */
export function addDisposeCallback(host: Component | Injector, callback: UnmountBlock): Component | Injector {
	if ('componentModel' in host) {
		host.componentModel.dispose = callback;
	} else {
		host.ctx.dispose = callback;
	}

	return host;
}

export function safeCall<T, U, Y>(fn: (p1?: T, p2?: U) => Y, arg1?: T, arg2?: U) {
	try {
		return fn && fn(arg1, arg2);
	} catch (err) {
		// tslint:disable-next-line:no-console
		console.error(err);
	}
}
