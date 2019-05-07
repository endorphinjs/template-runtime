import { finalizeItems } from './utils';
import { Injector, Component } from './types';

type Handler = (...args: any[]) => any;

/**
 * Adds pending event `name` handler
 */
export function addEvent(injector: Injector, name: string, handler: Handler): void {
	injector.events.cur[name] = handler;
}

/**
 * Adds given `handler` as event `name` listener
 */
export function addStaticEvent(elem: Element, name: string, handler: EventListener): void {
	handler && elem.addEventListener(name, handler);
}

/**
 * Finalizes events of given injector
 */
export function finalizeEvents(injector: Injector): number {
	return finalizeItems(injector.events, changeEvent, injector.parentNode);
}

/**
 * Returns function that must be invoked as event handler for given component
 */
export function getEventHandler(component: Component, name: string, ctx: HTMLElement): Handler | undefined {
	let fn: Handler | undefined = void 0;

	if (typeof component[name] === 'function') {
		fn = component[name].bind(component);
	} else {
		const handler = component.componentModel.definition[name];
		if (typeof handler === 'function') {
			fn = handler.bind(ctx);
		}
	}

	return fn;
}

/**
 * Invoked when event handler was changed
 */
function changeEvent(name: string, prevValue: EventListener, newValue: EventListener, elem: Element): void {
	prevValue && elem.removeEventListener(name, prevValue);
	addStaticEvent(elem, name, newValue);
}
