import { run, block, dispose, insert } from './injector';
import { isDefined } from './utils';
import { getScope } from './scope';

/**
 * Renders code, returned from `get` function, as HTML
 * @param {Component} host
 * @param {Injector} injector
 * @param {Function} get
 * @param {string} slotName
 * @returns {InnerHtmlContext}
 */
export function mountInnerHTML(host, injector, get, slotName) {
	/** @type {InnerHtmlContext} */
	const ctx = {
		host,
		injector,
		block: block(injector),
		scope: getScope(host),
		get,
		code: null,
		slotName
	};
	updateInnerHTML(ctx);
	return ctx;
}

/**
 * Updates inner HTML of block, defined in `ctx`
 * @param {InnerHtmlContext} ctx
 * @returns {number} Returns `1` if inner HTML was updated, `0` otherwise
 */
export function updateInnerHTML(ctx) {
	const { host, injector, block, scope } = ctx;
	const code = ctx.get(host, injector);
	let updated = 0;

	if (code !== ctx.code) {
		updated = 1;
		ctx.code = code;
		dispose(injector, block, scope, false);
		isDefined(code) && run(injector, block, renderHTML, host, ctx);
	}

	return updated;
}

/**
 * @param {InnerHtmlContext} ctx
 */
export function unmountInnerHTML(ctx) {
	dispose(ctx.injector, ctx.block, ctx.scope, true);
}

/**
 * @param {Component} host
 * @param {Injector} injector
 * @param {InnerHtmlContext} ctx
 */
function renderHTML(host, injector, ctx) {
	const div = document.createElement('div');
	div.innerHTML = ctx.code;
	const cssScope = host.componentModel.definition.cssScope;
	cssScope && scopeDOM(div, cssScope);
	while (div.firstChild) {
		insert(injector, div.firstChild, ctx.slotName);
	}
}

/**
 * Scopes CSS of all elements in given node
 * @param {Element} node
 * @param {string} cssScope
 */
function scopeDOM(node, cssScope) {
	node = /** @type {Element} */ (node.firstChild);
	while (node) {
		if (node.nodeType === node.ELEMENT_NODE) {
			node.setAttribute(cssScope, '');
			scopeDOM(node, cssScope);
		}
		node = /** @type {Element} */ (node.nextSibling);
	}
}
