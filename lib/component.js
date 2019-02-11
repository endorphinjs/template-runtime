import { elem } from './dom';
import { assign, isDefined, obj, changeSet, nextTick } from './utils';
import { finalizeEvents } from './event';
import { finalizeProps } from './attribute';
import { createInjector } from './injector';
import { runHook, forEachHook } from './hooks';
import { getScope } from './scope';

/**
 * Creates internal lightweight Endorphin component with given definition
 * @param {string} name
 * @param {import('../types').ComponentDefinition} definition
 * @param {import('../types').Component} [host]
 * @returns {import('../types').Component}
 */
export function createComponent(name, definition, host) {
	/** @type {import('../types').Component} */
	const element = elem(name, host);

	// Add host scope marker: we can’t rely on tag name since component
	// definition is bound to element element in runtime
	const { cssScope } = definition;
	if (cssScope) {
		element.setAttribute(cssScope + '-host', '');
	}

	element.refs = {};
	element.props = collectData(definition, 'props');
	element.state = collectData(definition, 'state');
	element.setProps = (value, silent) => setProps(element, value, silent);
	element.setState = (value, silent) => setState(element, value, silent);
	forEachHook(definition, 'methods', methods => assign(element, methods));

	// XXX Should point to Shadow Root in Web Components
	element.componentView = definition.componentView ? definition.componentView(host) : element;

	if (definition.store) {
		element.store = definition.store();
	}

	// Create slottted input
	const input = createInjector(element.componentView);
	input.slots = obj();

	element.componentModel = {
		definition,
		input,
		vars: obj(),
		refs: changeSet(),
		mounted: false,
		rendering: false,
		update: null,
		queued: null,
		detachEvents: attachStaticEvents(element, definition)
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
	elem.slots = input.slots;
	finalizeEvents(input);
	finalizeProps(input, initialProps);

	componentModel.rendering = true;
	runHook(elem, 'willMount');
	if (definition.default) {
		runHook(elem, 'willRender');
		componentModel.update = definition.default(elem, getScope(elem));
		componentModel.rendering = false;
		runHook(elem, 'didRender');
	}
	runHook(elem, 'didMount');
	componentModel.mounted = true;
}

/**
 * Updates given mounted component
 * @param {Component} elem
 * @param {object} initialProps
 */
export function updateComponent(elem) {
	const { componentModel } = elem;
	finalizeEvents(componentModel.input);
	finalizeProps(componentModel.input);
	renderComponent(elem);
}

/**
 * Destroys given component: removes static event listeners and cleans things up
 * @param {import('../types').Component} elem
 */
export function unmountComponent(elem) {
	const { componentModel } = elem;
	componentModel.mounted = false;
	componentModel.detachEvents();

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
 * @param {import('../types').Component} component
 * @param {string} keys
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
 */
function renderNext(elem) {
	if (!elem.componentModel.rendering) {
		renderComponent(elem);
	} else {
		scheduleRender(elem);
	}
}

/**
 * Schedules render of given component on next tick
 * @param {Component} elem
 */
export function scheduleRender(elem) {
	if (!elem.componentModel.queued) {
		elem.componentModel.queued = nextTick(() => {
			// It’s possible that a component can be rendered before next tick
			// (for example, if parent node updated component props).
			// Check if it’s still queued then render
			if (elem.componentModel.queued) {
				renderComponent(elem);
			}
		});
	}
}

/**
 * Renders given component
 * @param {Component} elem
 */
export function renderComponent(elem) {
	const { componentModel } = elem;

	componentModel.queued = null;
	componentModel.rendering = true;

	// TODO prepare data for hooks in `mountComponent`?
	runHook(elem, 'willUpdate');
	if (componentModel.update) {
		runHook(elem, 'willRender');
		componentModel.update(elem, getScope(elem));
		componentModel.rendering = false;
		runHook(elem, 'didRender');
	}
	runHook(elem, 'didUpdate');
}

/**
 * Updates properties of context component
 * @param {Component} elem
 * @param {object} value
 * @param {boolean} [silent]
 * @this Component
 */
function setProps(elem, value, silent) {
	if (value != null) {
		assign(elem.props, value);
		representProps(elem, value);
		!silent && elem.componentModel.mounted && renderNext(elem);
	}
}

/**
 * Updates state of context component
 * @param {Component} elem
 * @param {object} value
 * @param {boolean} [silent]
 */
function setState(elem, value, silent) {
	const { componentModel } = elem;
	if (value != null) {
		let updated = false;
		const prev = elem.state;

		for (const p in value) {
			if (prev[p] !== value[p]) {
				updated = true;
				break;
			}
		}

		if (updated) {
			assign(prev, value);

			// If we’re in rendering state than current `setState()` is caused by
			// one of the `will*` hooks, which means applied changes will be automatically
			// applied during rendering stage.
			// If called outside oif rendering state we should schedule render
			// on next tick
			if (!silent && componentModel.mounted && !componentModel.rendering) {
				scheduleRender(elem);
			}
		}
	}
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
 * @param {HTMLElement} elem
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
 * @return {object} Map of attached event handlers
 */
function attachStaticEvents(component, definition) {
	/** @type {{[name: string]: Array}} */
	const eventMap = obj();

	const handler = function(evt) {
		const listeners = eventMap[evt.type];
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
					eventMap[name].push(events[name]);
				} else {
					component.addEventListener(name, handler);
					eventMap[name] = [events[name]];
				}
			}
		}
	});

	return function detachStaticEvents() {
		for (let p in eventMap) {
			component.removeEventListener(p, handler);
		}
	};
}
