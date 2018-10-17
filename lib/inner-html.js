import { run, block, dispose, insert } from './injector';
import { isDefined, cssScope } from './utils';

/**
 * Renders code, returned from `get` function, as HTML
 * @param {Scope} scope
 * @param {Injector} injector
 * @param {function} get
 * @returns {function}
 */
export function mountInnerHTML(scope, injector, get, slotName) {
	return updateInnerHTML(scope, injector, {
		block: block(injector),
		code: null,
		get,
		slotName
	});
}

/**
 * Updates inner HTML of block, defined in `ctx`
 * @param {Scope} scope
 * @param {Injector} injector
 * @param {object} ctx
 */
export function updateInnerHTML(scope, injector, ctx) {
	const code = ctx.get(scope, injector);

	if (code !== ctx.code) {
		ctx.code = code;
		dispose(injector, ctx.block, false);
		isDefined(code) && run(injector, ctx.block, renderHTML, scope, ctx);
	}

	return ctx;
}

function renderHTML(scope, injector, ctx) {
	const div = document.createElement('div');
	div.innerHTML = ctx.code;
	scopeDOM(div, scope.css);
	while (div.firstChild) {
		insert(injector, div.firstChild, ctx.slotName);
	}
}

/**
 * Scopes CSS of all elements in given node
 * @param {Element} node
 * @param {string} scope
 */
function scopeDOM(node, scope) {
	node = node.firstChild;
	while (node) {
		if (node.nodeType === node.ELEMENT_NODE) {
			cssScope(node, scope);
			scopeDOM(node, scope);
		}
		node = node.nextSibling;
	}
}
