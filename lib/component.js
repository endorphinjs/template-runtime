import { elem } from './dom';
import { assign, obj, changeSet, representAttributeValue, safeCall, getObjectDescriptors } from './utils';
import { finalizeEvents } from './event';
import { normalizeClassName } from './attribute';
import { createInjector, disposeBlock } from './injector';
import { runHook, reverseWalkDefinitions } from './hooks';
import { getScope } from './scope';
import { updateSlots } from './slot';

/** @type {Array} */
let renderQueue = null;

/**
 * Creates internal lightweight Endorphin component with given definition
 * @param {string} name
 * @param {ComponentDefinition} definition
 * @param {Component} [host]
 * @returns {Component}
 */
export function createComponent(name, definition, host) {
	const element = /** @type {Component} */ (elem(name, host && host.componentModel && host.componentModel.definition.cssScope));

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
		update: null,
		queued: false,
		events,
		dispose: null,
		defaultProps: props
	};

	runHook(element, 'init');

	return element;
}

/**
 * Mounts given component
 * @param {Component} elem
 * @param {object} [initialProps]
 */
export function mountComponent(elem, initialProps) {
	const { componentModel } = elem;
	const { input, definition, defaultProps } = componentModel;

	let changes = setPropsInternal(elem, obj(), assign(obj(defaultProps), initialProps));
	const runtimeChanges = setPropsInternal(elem, input.attributes.prev, input.attributes.cur);

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
		runHook(elem, 'didSlotUpdate', p, input.slots[p]);
	}

	if (changes) {
		runHook(elem, 'didChange', arg);
	}

	runHook(elem, 'willMount', arg);
	runHook(elem, 'willRender', arg);
	componentModel.update = safeCall(definition.default, elem, getScope(elem));
	componentModel.mounted = true;
	componentModel.rendering = false;
	componentModel.finalizing = true;
	runHook(elem, 'didRender', arg);
	runHook(elem, 'didMount', arg);
	componentModel.finalizing = false;
}

/**
 * Updates given mounted component
 * @param {Component} elem
 */
export function updateComponent(elem) {
	const { input } = elem.componentModel;
	const changes = setPropsInternal(elem, input.attributes.prev, input.attributes.cur);
	finalizeEvents(input);
	updateSlots(elem);

	if (changes || elem.componentModel.queued) {
		renderNext(elem, changes);
	}
}

/**
 * Destroys given component: removes static event listeners and cleans things up
 * @param {Component} elem
 * @returns {void} Should return nothing since function result will be used
 * as shorthand to reset cached value
 */
export function unmountComponent(elem) {
	const { componentModel } = elem;
	const { slots, input, dispose, events } = componentModel;
	const scope = getScope(elem);

	runHook(elem, 'willUnmount');

	componentModel.mounted = false;
	if (events) {
		detachStaticEvents(elem, events);
	}

	if (elem.store) {
		elem.store.unwatch(elem);
	}

	// Detach own handlers
	// XXX doesn’t remove static events (via direct call of `addStaticEvent()`)
	const ownHandlers = input.events.prev;
	for (let p in ownHandlers) {
		elem.removeEventListener(p, ownHandlers[p]);
	}

	safeCall(dispose, scope);

	for (const slotName in slots) {
		disposeBlock(slots[slotName]);
	}

	runHook(elem, 'didUnmount');
	elem.componentModel = null;
}

/**
 * Subscribes to store updates of given component
 * @param {Component} component
 * @param {string[]} [keys]
 */
export function subscribeStore(component, keys) {
	if (!component.store) {
		throw new Error(`Store is not defined for ${component.nodeName} component`);
	}

	component.store.watch(component, keys);
}

/**
 * Queues next component render
 * @param {Component} elem
 * @param {Object} [changes]
 */
function renderNext(elem, changes) {
	if (!elem.componentModel.rendering) {
		renderComponent(elem, changes);
	} else {
		scheduleRender(elem, changes);
	}
}

/**
 * Schedules render of given component on next tick
 * @param {Component} elem
 * @param {Changes} [changes]
 */
export function scheduleRender(elem, changes) {
	if (!elem.componentModel.queued) {
		elem.componentModel.queued = true;
		if (renderQueue) {
			renderQueue.push(elem, changes);
		} else {
			renderQueue = [elem, changes];
			requestAnimationFrame(drainQueue);
		}
	}
}

/**
 * Renders given component
 * @param {Component} elem
 * @param {Changes} [changes]
 */
export function renderComponent(elem, changes) {
	const { componentModel } = elem;
	const arg = changes || {};

	componentModel.queued = false;
	componentModel.rendering = true;

	if (changes) {
		runHook(elem, 'didChange', arg);
	}

	// TODO prepare data for hooks in `mountComponent`?
	runHook(elem, 'willUpdate', arg);
	runHook(elem, 'willRender', arg);
	safeCall(componentModel.update, elem, getScope(elem));
	componentModel.rendering = false;
	componentModel.finalizing = true;
	runHook(elem, 'didRender', arg);
	runHook(elem, 'didUpdate', arg);
	componentModel.finalizing = false;
}

/**
 * Removes attached events from given map
 * @param {Component} component
 * @param {AttachedStaticEvents} eventMap
 */
function detachStaticEvents(component, eventMap) {
	const { listeners, handler } = eventMap;
	for (let p in listeners) {
		component.removeEventListener(p, handler);
	}
}

/**
 * @param {string} ch
 * @returns {string}
 */
function kebabCase(ch) {
	return '-' + ch.toLowerCase();
}

/**
 * @param {Component} component
 * @param {Object} prevProps
 * @param {Object} nextProps
 * @returns {Changes}
 */
function setPropsInternal(component, prevProps, nextProps) {
	/** @type {Changes} */
	const changes = {};
	let hasChanges = false;
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
			hasChanges = true;
			props[p] = prevProps[p] = current;
			changes[p] = { current, prev };

			if (!/^partial:/.test(p)) {
				representAttributeValue(component, p.replace(/[A-Z]/g, kebabCase), current);
			}
		}

		nextProps[p] = null;
	}

	return hasChanges ? changes : null;
}

/**
 * Check if `next` contains value that differs from one in `prev`
 * @param {Object} prev
 * @param {Object} next
 * @returns {boolean}
 */
function hasChanges(prev, next) {
	for (const p in next) {
		if (next[p] !== prev[p]) {
			return true;
		}
	}
}

/**
 * Prepares internal data for given component
 * @param {Component} component
 * @param {ComponentDefinition} definition
 */
function prepare(component, definition) {
	const props = obj();
	const state = obj();
	const methods = obj();
	/** @type {AttachedStaticEvents} */
	let events;
	let extend;

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
function createEventsMap(component) {
	/** @type {{[event: string]: ComponentEventHandler[]}} */
	const listeners = obj();

	/** @type {StaticEventHandler} */
	const handler = function (evt) {
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
function attachEventHandlers(component, events, eventMap) {
	const names = Object.keys(events);
	const { listeners } = eventMap;
	for (let i = 0, name; i < names.length; i++) {
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
	const pending = renderQueue;
	renderQueue = null;

	for (let i = 0, component; i < pending.length; i += 2) {
		component = pending[i];

		// It’s possible that a component can be rendered before next tick
		// (for example, if parent node updated component props).
		// Check if it’s still queued then render.
		// Also, component can be unmounted after it’s rendering was scheduled
		if (component.componentModel && component.componentModel.queued) {
			renderComponent(component, pending[i + 1]);
		}
	}
}
