import { finalizeItems } from './utils';

/**
 * Adds pending event `name` handler
 * @param {Injector} injector
 * @param {string} name
 * @param {function} handler
 */
export function addEvent(injector, name, handler) {
	injector.events.cur[name] = handler;
}

/**
 * Adds given `handler` as event `name` listener
 * @param {Element} elem
 * @param {string} name
 * @param {function} handler
 */
export function addStaticEvent(elem, name, handler) {
	handler && elem.addEventListener(name, handler);
}

/**
 * Finalizes events of given injector
 * @param {Injector} injector
 * @returns {number} Update status
 */
export function finalizeEvents(injector) {
	return finalizeItems(injector.events, changeEvent, injector.parentNode);
}

/**
 * Returns function that must be invoked as event handler for given component
 * @param {Component} component
 * @param {string} name Method name
 * @param {HTMLElement} ctx Context element where event listener was added
 * @returns {function?}
 */
export function getEventHandler(component, name, ctx) {
	let fn;

	if (typeof component[name] === 'function') {
		fn = component[name].bind(component);
	} else {
		const handler = component.componentModel.definition[name];
		if (typeof handler === 'function') {
			fn = handler.bind(ctx);
		}
	}

	if (fn) {
		fn.displayName = name;
	}

	return fn;
}

/**
 * Invoked when event handler was changed
 * @param {string} name
 * @param {function} prevValue
 * @param {function} newValue
 * @param {Element} elem
 */
function changeEvent(name, prevValue, newValue, elem) {
	prevValue && elem.removeEventListener(name, prevValue);
	addStaticEvent(elem, name, newValue);
}
