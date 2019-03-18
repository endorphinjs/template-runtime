import { run, insert, injectBlock, disposeBlock, emptyBlockContent } from './injector';
import { isDefined } from './utils';
import { getScope } from './scope';

/**
 * Renders code, returned from `get` function, as HTML
 * @param {Component} host
 * @param {Injector} injector
 * @param {Function} get
 * @param {string} slotName
 * @returns {InnerHtmlBlock}
 */
export function mountInnerHTML(host, injector, get, slotName) {
	/** @type {InnerHtmlBlock} */
	const block = injectBlock(injector, {
		$$block: true,
		host,
		injector,
		scope: getScope(host),
		dispose: null,
		get,
		code: null,
		slotName,
		start: null,
		end: null
	});
	updateInnerHTML(block);
	return block;
}

/**
 * Updates inner HTML of block, defined in `ctx`
 * @param {InnerHtmlBlock} block
 * @returns {number} Returns `1` if inner HTML was updated, `0` otherwise
 */
export function updateInnerHTML(block) {
	const code = block.get(block.host, block.scope);

	if (code !== block.code) {
		emptyBlockContent(block);
		if (isDefined(block.code = code)) {
			run(block, renderHTML, block);
		}
		block.injector.ptr = block.end;
		return 1;
	}

	return 0;
}

/**
 * @param {InnerHtmlBlock} ctx
 */
export function unmountInnerHTML(ctx) {
	disposeBlock(ctx);
}

/**
 * @param {Component} host
 * @param {Injector} injector
 * @param {InnerHtmlBlock} ctx
 */
function renderHTML(host, injector, ctx) {
	const { code } = ctx;
	const { cssScope } = host.componentModel.definition;

	if (code && code.nodeType) {
		// Insert as DOM element
		cssScope && scopeDOM(code, cssScope);
		insert(injector, code, ctx.slotName);
	} else {
		// Render as HTML
		const div = document.createElement('div');
		div.innerHTML = ctx.code;

		cssScope && scopeDOM(div, cssScope);
		while (div.firstChild) {
			insert(injector, div.firstChild, ctx.slotName);
		}
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
