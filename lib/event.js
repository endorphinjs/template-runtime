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

export function finalizeEvents(scope, injector) {
	finalizeItems(scope, injector.parentNode, injector.events, changeEvent);
}

/**
 * Invoked when event handler was changed
 * @param {Element} elem
 * @param {string} name
 * @param {function} prevValue
 * @param {function} newValue
 */
function changeEvent(scope, elem, name, prevValue, newValue) {
	prevValue && elem.removeEventListener(name, prevValue);
	addStaticEvent(elem, name, newValue);
}
