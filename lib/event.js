import { finalizeItems } from './utils';

export function addEvent(injector, name, handler) {
	injector.events.cur[name] = handler;
}

export function finalizeEvents(scope, injector, staticEvents) {
	finalizeItems(scope, injector.parentNode, injector.events, changeEvent, staticEvents);
}

/**
 * Invoked when event handler was changed
 * @param {Element} elem
 * @param {string} name
 * @param {function} prevValue
 * @param {function} newValue
 */
function changeEvent(scope, elem, name, prevValue, newValue) {
	if (prevValue) {
		elem.removeEventListener(name, prevValue);
	}

	if (newValue) {
		elem.addEventListener(name, newValue);
	}
}
