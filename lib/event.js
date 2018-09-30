import { finalizeItems } from './utils';

export function addEvent(injector, name, handler) {
	injector.events.cur[name] = handler;
}

export function finalizeEvents(injector, staticEvents) {
	finalizeItems(injector.parentNode, injector.events, changeEvent, staticEvents);
}

/**
 * Invoked when event handler was changed
 * @param {Element} elem
 * @param {string} name
 * @param {function} prevValue
 * @param {function} newValue
 */
function changeEvent(elem, name, prevValue, newValue) {
	if (prevValue) {
		elem.removeEventListener(name, prevValue);
	}

	if (newValue) {
		elem.addEventListener(name, newValue);
	}
}
