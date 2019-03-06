import { elem } from './dom';
import { assign, obj, changeSet, nextTick, representAttributeValue } from './utils';
import { finalizeEvents } from './event';
import { normalizeClassName } from './attribute';
import { createInjector, disposeBlock } from './injector';
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

	const defaultProps = collectData(definition, 'props');
	element.refs = {};
	element.props = obj(defaultProps);
	element.state = collectData(definition, 'state');
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

	forEachHook(definition, 'methods', methods => assign(element, methods));

	// XXX Should point to Shadow Root in Web Components
	if (!element.componentView) {
		element.componentView = element;
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
		update: null,
		queued: null,
		events: attachStaticEvents(element, definition),
		dispose: null,
		defaultProps
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

	const args = [changes || {}];
	finalizeEvents(input);

	componentModel.rendering = true;

	// Notify slot status
	for (const p in input.slots) {
		runHook(elem, 'didSlotUpdate', [p, input.slots[p]]);
	}

	if (changes) {
		runHook(elem, 'didChange', args);
	}

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
	const { input } = elem.componentModel;
	const changes = setPropsInternal(elem, input.attributes.prev, input.attributes.cur);
	finalizeEvents(input);
	updateSlots(elem);

	if (changes) {
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
	const { slots, input, dispose } = componentModel;
	const scope = getScope(elem);

	runHook(elem, 'willUnmount');

	componentModel.mounted = false;
	detachStaticEvents(elem, componentModel.events);

	if (elem.store) {
		elem.store.unwatch(elem);
	}

	// Detach own handlers
	// XXX doesn’t remove static events (via direct call of `addStaticEvent()`)
	const ownHandlers = input.events.prev;
	for (let p in ownHandlers) {
		elem.removeEventListener(p, ownHandlers[p]);
	}

	dispose && dispose(scope);

	for (const slotName in slots) {
		disposeBlock(slots[slotName].block, scope, true);
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

	if (changes) {
		runHook(elem, 'didChange', args);
	}

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
 * Collects and attaches static event listeners to `component` from given `definition`
 * @param {Component} component
 * @param {ComponentDefinition} definition
 * @return {AttachedEventsMap} Map of attached event handlers
 */
function attachStaticEvents(component, definition) {
	/** @type {AttachedEventsMap} */
	const eventMap = obj();

	/** @param {Event} evt */
	const handler = function (evt) {
		if (!component.componentModel) {
			// In case if component was unmounted
			return;
		}

		const listeners = eventMap[evt.type].listeners;
		for (let i = 0; i < listeners.length; i++) {
			listeners[i](component, evt, this);
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
