import { elem } from './dom';
import { assign, obj, changeSet, representAttributeValue, safeCall, getObjectDescriptors } from './utils';
import { finalizeEvents } from './event';
import { normalizeClassName } from './attribute';
import { createInjector, disposeBlock } from './injector';
import { runHook, reverseWalkDefinitions } from './hooks';
import { getScope } from './scope';
import { updateSlots } from './slot';
import { Changes, Component, ComponentDefinition, AttachedStaticEvents, ComponentEventHandler, StaticEventHandler } from './types';

let renderQueue: Array<Component | Changes | undefined> | null = null;

/**
 * Creates internal lightweight Endorphin component with given definition
 */
export function createComponent(name: string, definition: ComponentDefinition, host?: Component): Component {
	const element = elem(name, host && host.componentModel && host.componentModel.definition.cssScope) as Component;

	// Add host scope marker: we can’t rely on tag name since component
	// definition is bound to element in runtime, not compile time
	const { cssScope } = definition;
	if (cssScope) {
		element.setAttribute(cssScope + '-host', '');
	}

	if (host && host.componentModel) {
		// Passed component as parent: detect app root
		element.root = host.root || host;
	}

	// XXX Should point to Shadow Root in Web Components
	element.componentView = element;

	const { props, state, extend, methods, events } = prepare(element, definition);

	element.refs = {};
	element.props = obj(props);
	element.state = state;
	element.setProps = function setProps(value) {
		const { componentModel } = element;

		// In case of calling `setProps` after component was unmounted,
		// check if `componentModel` is available
		if (value != null && componentModel && componentModel.mounted) {
			const changes = setPropsInternal(element, element.props, obj(value));
			changes && renderNext(element, changes);
		}
	};

	element.setState = function setState(value) {
		const { componentModel } = element;

		// In case of calling `setState` after component was unmounted,
		// check if `componentModel` is available
		if (value != null && componentModel && hasChanges(element.state, value)) {
			assign(element.state, value);

			// If we’re in rendering state than current `setState()` is caused by
			// one of the `will*` hooks, which means applied changes will be automatically
			// applied during rendering stage.
			// If called outside of rendering state we should schedule render
			// on next tick
			if (componentModel.mounted && !componentModel.rendering) {
				scheduleRender(element);
			}
		}
	};

	assign(element, methods);

	if (extend) {
		Object.defineProperties(element, extend);
	}

	if (definition.store) {
		element.store = definition.store();
	} else if (element.root && element.root.store) {
		element.store = element.root.store;
	}

	// Create slotted input
	const input = createInjector(element.componentView);
	input.slots = obj();

	element.componentModel = {
		definition,
		input,
		vars: obj(),
		refs: changeSet(),
		slots: obj(),
		slotStatus: obj(),
		mounted: false,
		rendering: false,
		finalizing: false,
		update: void 0,
		queued: false,
		events,
		dispose: void 0,
		defaultProps: props
	};

	runHook(element, 'init');

	return element;
}

/**
 * Mounts given component
 */
export function mountComponent(component: Component, initialProps?: object) {
	const { componentModel } = component;
	const { input, definition, defaultProps } = componentModel;

	let changes = setPropsInternal(component, obj(), assign(obj(defaultProps), initialProps));
	const runtimeChanges = setPropsInternal(component, input.attributes.prev, input.attributes.cur);

	if (changes && runtimeChanges) {
		assign(changes, runtimeChanges);
	} else if (runtimeChanges) {
		changes = runtimeChanges;
	}

	const arg = changes || {};
	finalizeEvents(input);

	componentModel.rendering = true;

	// Notify slot status
	for (const p in input.slots) {
		runHook(component, 'didSlotUpdate', p, input.slots[p]);
	}

	if (changes) {
		runHook(component, 'didChange', arg);
	}

	runHook(component, 'willMount', arg);
	runHook(component, 'willRender', arg);
	componentModel.update = safeCall(definition.default, component, getScope(component));
	componentModel.mounted = true;
	componentModel.rendering = false;
	componentModel.finalizing = true;
	runHook(component, 'didRender', arg);
	runHook(component, 'didMount', arg);
	componentModel.finalizing = false;
}

/**
 * Updates given mounted component
 */
export function updateComponent(component: Component) {
	const { input } = component.componentModel;
	const changes = setPropsInternal(component, input.attributes.prev, input.attributes.cur);
	finalizeEvents(input);
	updateSlots(component);

	if (changes || component.componentModel.queued) {
		renderNext(component, changes!);
	}
}

/**
 * Destroys given component: removes static event listeners and cleans things up
 * @returns Should return nothing since function result will be used
 * as shorthand to reset cached value
 */
export function unmountComponent(component: Component): void {
	const { componentModel } = component;
	const { slots, input, dispose, events } = componentModel;
	const scope = getScope(component);

	runHook(component, 'willUnmount');

	componentModel.mounted = false;
	if (events) {
		detachStaticEvents(component, events);
	}

	if (component.store) {
		component.store.unwatch(component);
	}

	// Detach own handlers
	// XXX doesn’t remove static events (via direct call of `addStaticEvent()`)
	const ownHandlers = input.events.prev;
	for (const p in ownHandlers) {
		component.removeEventListener(p, ownHandlers[p]);
	}

	safeCall(dispose, scope);

	for (const slotName in slots) {
		disposeBlock(slots[slotName]);
	}

	runHook(component, 'didUnmount');

	// @ts-ignore: Nulling disposed object
	component.componentModel = null;
}

/**
 * Subscribes to store updates of given component
 * @param {Component} component
 * @param {string[]} [keys]
 */
export function subscribeStore(component: Component, keys: string[]) {
	if (!component.store) {
		throw new Error(`Store is not defined for ${component.nodeName} component`);
	}

	component.store.watch(component, keys);
}

/**
 * Queues next component render
 */
function renderNext(component: Component, changes?: Changes) {
	if (!component.componentModel.rendering) {
		renderComponent(component, changes);
	} else {
		scheduleRender(component, changes);
	}
}

/**
 * Schedules render of given component on next tick
 */
export function scheduleRender(component: Component, changes?: Changes) {
	if (!component.componentModel.queued) {
		component.componentModel.queued = true;
		if (renderQueue) {
			renderQueue.push(component, changes);
		} else {
			renderQueue = [component, changes];
			requestAnimationFrame(drainQueue);
		}
	}
}

/**
 * Renders given component
 */
export function renderComponent(component: Component, changes?: Changes) {
	const { componentModel } = component;
	const arg = changes || {};

	componentModel.queued = false;
	componentModel.rendering = true;

	if (changes) {
		runHook(component, 'didChange', arg);
	}

	// TODO prepare data for hooks in `mountComponent`?
	runHook(component, 'willUpdate', arg);
	runHook(component, 'willRender', arg);
	safeCall(componentModel.update, component, getScope(component));
	componentModel.rendering = false;
	componentModel.finalizing = true;
	runHook(component, 'didRender', arg);
	runHook(component, 'didUpdate', arg);
	componentModel.finalizing = false;
}

/**
 * Removes attached events from given map
 * @param {Component} component
 * @param {AttachedStaticEvents} eventMap
 */
function detachStaticEvents(component: Component, eventMap: AttachedStaticEvents) {
	const { listeners, handler } = eventMap;
	for (const p in listeners) {
		component.removeEventListener(p, handler);
	}
}

/**
 * @param {string} ch
 * @returns {string}
 */
function kebabCase(ch: string): string {
	return '-' + ch.toLowerCase();
}

function setPropsInternal(component: Component, prevProps: object, nextProps: object): Changes | null {
	const changes: Changes = {};
	let didChanged = false;
	const { props } = component;
	const { defaultProps } = component.componentModel;

	for (const p in nextProps) {
		const prev = prevProps[p];
		let current = nextProps[p];

		if (current == null) {
			current = defaultProps[p];
		}

		if (p === 'class' && current != null) {
			current = normalizeClassName(current);
		}

		if (current !== prev) {
			didChanged = true;
			props[p] = prevProps[p] = current;
			changes[p] = { current, prev };

			if (!/^partial:/.test(p)) {
				representAttributeValue(component, p.replace(/[A-Z]/g, kebabCase), current);
			}
		}

		nextProps[p] = null;
	}

	return didChanged ? changes : null;
}

/**
 * Check if `next` contains value that differs from one in `prev`
 * @param {Object} prev
 * @param {Object} next
 * @returns {boolean}
 */
function hasChanges(prev: object, next: object): boolean {
	for (const p in next) {
		if (next[p] !== prev[p]) {
			return true;
		}
	}

	return false;
}

/**
 * Prepares internal data for given component
 * @param {Component} component
 * @param {ComponentDefinition} definition
 */
function prepare(component: Component, definition: ComponentDefinition) {
	const props = obj();
	const state = obj();
	const methods = obj();
	let events: AttachedStaticEvents | undefined = void 0;
	let extend: any;

	reverseWalkDefinitions(definition, dfn => {
		dfn.props && assign(props, dfn.props(component));
		dfn.state && assign(state, dfn.state(component));
		dfn.methods && assign(methods, dfn.methods);

		if (dfn.extend) {
			const descriptors = getObjectDescriptors(dfn.extend);
			extend = extend ? assign(extend, descriptors) : descriptors;
		}

		if (dfn.events) {
			if (!events) {
				events = createEventsMap(component);
			}
			attachEventHandlers(component, dfn.events, events);
		}
	});

	return { props, state, extend, methods, events };
}

/**
 * @param {Component} component
 * @returns {AttachedStaticEvents}
 */
function createEventsMap(component: Component): AttachedStaticEvents {
	const listeners: { [event: string]: ComponentEventHandler[]; } = obj();

	const handler: StaticEventHandler = function(this: HTMLElement, evt: Event) {
		if (component.componentModel) {
			const handlers = listeners[evt.type];
			for (let i = 0; i < handlers.length; i++) {
				handlers[i](component, evt, this);
			}
		}
	};

	return { handler, listeners };
}

/**
 * @param {Component} component
 * @param {{[name: string]: ComponentEventHandler}} events
 * @param {AttachedStaticEvents} eventMap
 */
function attachEventHandlers(component: Component, events: { [name: string]: ComponentEventHandler; }, eventMap: AttachedStaticEvents) {
	const names = Object.keys(events);
	const { listeners } = eventMap;
	for (let i = 0, name: string; i < names.length; i++) {
		name = names[i];
		if (name in listeners) {
			listeners[name].push(events[name]);
		} else {
			component.addEventListener(name, eventMap.handler);
			listeners[name] = [events[name]];
		}
	}
}

function drainQueue() {
	const pending = renderQueue!;
	renderQueue = null;

	for (let i = 0, component: Component; i < pending.length; i += 2) {
		component = pending[i] as Component;

		// It’s possible that a component can be rendered before next tick
		// (for example, if parent node updated component props).
		// Check if it’s still queued then render.
		// Also, component can be unmounted after it’s rendering was scheduled
		if (component.componentModel && component.componentModel.queued) {
			renderComponent(component, pending[i + 1] as Changes);
		}
	}
}
