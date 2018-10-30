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
