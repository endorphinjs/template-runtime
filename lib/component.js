import { elem } from './dom';
import { assign, isDefined, obj, changeSet, nextTick, changed } from './utils';
import { finalizeEvents } from './event';
import { finalizeProps } from './attribute';
import { createInjector } from './injector';
import { runHook, forEachHook } from './hooks';
import { getScope } from './scope';
import { updateSlots } from './slot';

/**
 * Creates internal lightweight Endorphin component with given definition
 * @param {string} name
 * @param {ComponentDefinition} definition
 * @param {Component} [host]
 * @returns {Component}
 */
export function createComponent(name, definition, host) {
	/** @type {Component} */
	// @ts-ignore
	const element = elem(name, host && host.componentModel && host.componentModel.definition.cssScope);

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

	element.refs = {};
	element.props = collectData(definition, 'props');
	element.state = collectData(definition, 'state');
	element.setProps = function setProps(value, silent) {
		if (value != null) {
			assign(element.props, value);
			representProps(element, value);
			if (!silent && element.componentModel.mounted) {
				renderNext(element, value);
			}
		}
	};

	element.setState = function setState(value, silent) {
		if (value != null && changed(value, element.state)) {
			const { componentModel } = element;
			assign(element.state, value);

			// If we’re in rendering state than current `setState()` is caused by
			// one of the `will*` hooks, which means applied changes will be automatically
			// applied during rendering stage.
			// If called outside oif rendering state we should schedule render
			// on next tick
			if (!silent && componentModel.mounted && !componentModel.rendering) {
				scheduleRender(element);
			}
		}
	};

	forEachHook(definition, 'methods', methods => assign(element, methods));

	// XXX Should point to Shadow Root in Web Components
	element.componentView = definition.componentView ? definition.componentView(element, host) : element;

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
		mounted: false,
		rendering: false,
		update: null,
		queued: null,
		events: attachStaticEvents(element, definition)
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
	const { input, definition } = componentModel;
	finalizeEvents(input);
	finalizeProps(input, initialProps);

	const args = [initialProps || {}];

	componentModel.rendering = true;
	runHook(elem, 'willMount', args);
	if (definition.default) {
		runHook(elem, 'willRender', args);
		componentModel.update = definition.default(elem, getScope(elem));
		componentModel.rendering = false;
		runHook(elem, 'didRender', args);
	}
	runHook(elem, 'didMount', args);
	componentModel.mounted = true;
}

/**
 * Updates given mounted component
 * @param {Component} elem
 */
export function updateComponent(elem) {
	const { componentModel } = elem;
	finalizeEvents(componentModel.input);
	updateSlots(elem);
	const changes = finalizeProps(componentModel.input);
	if (changes) {
		renderComponent(elem, changes);
	}
}

/**
 * Destroys given component: removes static event listeners and cleans things up
 * @param {Component} elem
 */
export function unmountComponent(elem) {
	const { componentModel } = elem;
	componentModel.mounted = false;
	detachStaticEvents(elem, componentModel.events);

	if (elem.store) {
		elem.store.unwatch(elem);
	}

	// Detach own handlers
	// XXX doesn’t remove static events (via direct call of `addStaticEvent()`)
	const ownHandlers = componentModel.input.events.prev;
	for (let p in ownHandlers) {
		elem.removeEventListener(p, ownHandlers[p]);
	}

	runHook(elem, 'didUnmount');
	elem.componentModel = null;
}

/**
 * Subscribes to store updates of given component
 * @param {Component} component
 * @param {string[]} keys
 */
export function subscribeStore(component, keys) {
	if (!component.store) {
		throw new Error(`Store is not defined in ${component.nodeName} component definition`);
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
 * @param {Object} [changes]
 */
export function scheduleRender(elem, changes) {
	if (!elem.componentModel.queued) {
		elem.componentModel.queued = nextTick(() => {
			// It’s possible that a component can be rendered before next tick
			// (for example, if parent node updated component props).
			// Check if it’s still queued then render
			if (elem.componentModel.queued) {
				renderComponent(elem, changes);
			}
		});
	}
}

/**
 * Renders given component
 * @param {Component} elem
 * @param {Object} [changes]
 */
export function renderComponent(elem, changes) {
	const { componentModel } = elem;
	const args = [changes || {}];

	componentModel.queued = null;
	componentModel.rendering = true;

	// TODO prepare data for hooks in `mountComponent`?
	runHook(elem, 'willUpdate', args);
	if (componentModel.update) {
		runHook(elem, 'willRender', args);
		componentModel.update(elem, getScope(elem));
		componentModel.rendering = false;
		runHook(elem, 'didRender', args);
	} else {
		componentModel.rendering = false;
	}

	runHook(elem, 'didUpdate', args);
}

/**
 * Collects data generated by `key` factory
 * @param {ComponentDefinition} definition
 * @param {string} key
 * @return {object} initial
 */
function collectData(definition, key) {
	const data = {};
	forEachHook(definition, key, hook => assign(data, hook()));
	return data;
}

/**
 * Represents given props as attribute values in `elem`
 * @param {Element} elem
 * @param {object} props
 */
function representProps(elem, props) {
	for (const p in props) {
		// Do not represent passed partials: these are internals
		if (!/^partial:/.test(p)) {
			let value = props[p];
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

			isDefined(value) ? elem.setAttribute(p, value) : elem.removeAttribute(p);
		}
	}
}

/**
 * Collects and attaches static event listeners to `component` from given `definition`
 * @param {Component} component
 * @param {ComponentDefinition} definition
 * @return {AttachedEventsMap} Map of attached event handlers
 */
function attachStaticEvents(component, definition) {
	/** @type {AttachedEventsMap} */
	const eventMap = obj();

	const handler = function(evt) {
		const listeners = eventMap[evt.type].listeners;
		for (let i = 0; i < listeners.length; i++) {
			listeners[i].call(this, evt, component);
		}
	};

	forEachHook(definition, 'events', events => {
		if (events) {
			const names = Object.keys(events);
			for (let i = 0, name; i < names.length; i++) {
				name = names[i];
				if (name in eventMap) {
					eventMap[name].listeners.push(events[name]);
				} else {
					component.addEventListener(name, handler);
					eventMap[name] = {
						handler,
						listeners: [events[name]]
					};
				}
			}
		}
	});

	return eventMap;
}

/**
 * Removes attached events from given map
 * @param {Component} component
 * @param {AttachedEventsMap} eventMap
 */
function detachStaticEvents(component, eventMap) {
	for (let p in eventMap) {
		component.removeEventListener(p, eventMap[p].handler);
	}
}
