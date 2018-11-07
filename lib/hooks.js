/**
 * Invokes `fn` for each `name` hook in given definition
 * @param {ComponentDefinition} definition
 * @param {string} name
 * @param {function} fn
 */
export function forEachHook(definition, name, fn) {
	const { plugins } = definition;

	if (plugins) {
		for (let i = 0; i < plugins.length; i++) {
			forEachHook(plugins[i], name, fn);
		}
	}

	if (name in definition) {
		return fn(definition[name], definition);
	}
}

/**
 * Invokes `name` hook for given component definition
 * @param {ComponentDefinition} definition
 * @param {string} name
 * @param {Array} args
 */
export function runHook(definition, name, args) {
	return forEachHook(definition, name, hook => hook.call(null, args));
}
