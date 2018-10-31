import { elem } from './dom';
import { assign } from './utils';
import { finalizeEvents } from './event';
import { finalizeProps } from './attribute';
import { createInjector } from './injector';

/**
 * Creates internal lightweight Endorphin component with given definition
 * @param {string} name
 * @param {ComponentDefinition} definition
 * @param {string} [scope]
 * @returns {ComponentContainer}
 */
export function createComponent(name, definition, scope) {
	const { props, state, methods } = definition;

	const element = elem(name, scope);
	element.props = props && props(element) || {};
	element.state = state && state(element) || {};
	element.refs = {};
	methods && assign(element, methods);

	// XXX Should point to Shadow Root in Web Components
	element.componentView = element;

	const component = {
		element,
		definition,
		injector: createInjector(element, true),
		update: null
	};

	element.setProps = (value) => {
		assign(element.props, value);
		renderComponent(component);
	};

	element.setState = (value) => {
		if (value && assignIfNeeded(element.state, value)) {
			renderComponent(component);
		}
	};

	return component;
}

/**
 * Mounts given component
 * @param {ComponentContainer} component
 * @param {object} [initialProps]
 */
export function mountComponent(component, initialProps) {
	const { element, injector } = component;
	element.slots = injector.slots;
	finalizeEvents(injector);
	finalizeProps(injector, initialProps) || renderComponent(component);
}

/**
 * Updates given mounted component
 * @param {ComponentContainer} component
 * @param {object} initialProps
 */
export function updateComponent(component) {
	const { injector } = component;
	finalizeEvents(injector);
	finalizeProps(injector);
}

/**
 * Renders given component
 * @param {ComponentContainer} component
 */
export function renderComponent(component) {
	const { update } = component;
	if (update) {
		update(component);
	} else {
		component.update = component.definition.render(component);
	}
}

/**
 * Assign data from `next` to `prev` if there are any updates
 * @param {object} prev
 * @param {object} next
 * @return {boolean} Retruns `true` if data is assigned
 */
function assignIfNeeded(prev, next) {
	for (const p in next) {
		if (next.hasOwnProperty(p) && prev[p] !== next[p]) {
			return assign(prev, next);
		}
	}
}
