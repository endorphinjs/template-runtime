import { run, block, dispose, insert } from './injector';
import { isDefined, cssScope } from './utils';

/**
 * Renders code, returned from `get` function, as HTML
 * @param {Component} component
 * @param {Injector} injector
 * @param {function} get
 * @returns {function}
 */
export function mountInnerHTML(component, injector, get, slotName) {
	return updateInnerHTML({
		component,
		injector,
		block: block(injector),
		get,
		code: null,
		slotName
	});
}

/**
 * Updates inner HTML of block, defined in `ctx`
 * @param {object} ctx
 */
export function updateInnerHTML(ctx) {
	const { component, injector, block } = ctx;
	const code = ctx.get(component, injector);

	if (code !== ctx.code) {
		ctx.code = code;
		dispose(injector, block, false);
		isDefined(code) && run(injector, block, renderHTML, component, ctx);
	}

	return ctx;
}

function renderHTML(host, injector, ctx) {
	const div = document.createElement('div');
	div.innerHTML = ctx.code;
	scopeDOM(div, host);
	while (div.firstChild) {
		insert(injector, div.firstChild, ctx.slotName);
	}
}

/**
 * Scopes CSS of all elements in given node
 * @param {Element} node
 * @param {Comment} host
 */
function scopeDOM(node, host) {
	node = node.firstChild;
	while (node) {
		if (node.nodeType === node.ELEMENT_NODE) {
			cssScope(node, host);
			scopeDOM(node, host);
		}
		node = node.nextSibling;
	}
}
