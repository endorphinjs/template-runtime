const hookKey = '&hook';
/**
 * Attaches hook for invoking lifecycle events on given component
 * @param {ComponentModel} component
 * @param {ComponentDefinition} definition
 * @returns {ComponentModel}
 */
export function attachHook(component, definition) {
	component[hookKey] = function(name, args) {
		const hook = definition[name];

		if (typeof hook === 'function') {
			hook.apply(component, args);
		}
	};

	return component;
}

/**
 * Runs specified hook of given component
 * @param {ComponentModel} component
 * @param {string} hookName
 */
export function runHook(component, hookName) {
	component[hookKey](hookName, Array.prototype.slice.call(arguments, 2));
}
