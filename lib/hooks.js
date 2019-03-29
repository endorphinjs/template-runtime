import { safeCall } from './utils';

/**
 * Walks over each definition (including given one) and runs callback on it
 * @param {ComponentDefinition} definition
 * @param {(dfn: ComponentDefinition) => void} fn
 */
export function walkDefinitions(definition, fn) {
	safeCall(fn, definition);
	const { plugins } = definition;
	if (plugins) {
		for (let i = 0; i < plugins.length; i++) {
			walkDefinitions(plugins[i], fn);
		}
	}
}

/**
 * Same as `walkDefinitions` but runs in reverse order
 * @param {ComponentDefinition} definition
 * @param {(dfn: ComponentDefinition) => void} fn
 */
export function reverseWalkDefinitions(definition, fn) {
	const { plugins } = definition;
	if (plugins) {
		let i = plugins.length;
		while (i--) {
			walkDefinitions(plugins[i], fn);
		}
	}

	safeCall(fn, definition);
}

/**
 * Invokes `name` hook for given component definition
 * @param {Component} elem
 * @param {string} name
 * @param {*} [arg1]
 * @param {*} [arg2]
 */
export function runHook(elem, name, arg1, arg2) {
	walkDefinitions(elem.componentModel.definition, dfn => {
		const hook = dfn[name];
		if (typeof hook === 'function') {
			hook(elem, arg1, arg2);
		}
	});
}
