import {
	elem, text, elemWithText, insert, getProp, getVar, updateText,
	updateAttribute, createInjector, mountIterator, updateIterator, enterScope,
	exitScope, assign
} from '../../../runtime';

export default function innerComponentTemplate(host) {
	const target = host.componentView;
	target.appendChild(elemWithText('h3', 'Inner component', host));
	const ul = target.appendChild(elem('ul'));
	const injector2 = createInjector(ul);
	const iter1 = mountIterator(host, injector2, forEachExpr1, forEachBody1);

	return function partialsTemplateUpdate() {
		updateIterator(iter1);
	};
}

function getPartialItemVars(host) {
	return {
		item: getVar(host, 'value'),
		pos: getVar(host, 'index')
	};
}

function preparePartialItemVars(vars) {
	return assign({
		pos: 0,
		item: null
	}, vars);
}

export function partialItem(host, injector, vars) {
	enterScope(host, preparePartialItemVars(vars));

	const li = insert(injector, elem('li', host));
	const injector2 = createInjector(li);
	let attr1Value = updateAttribute(li, 'pos', getVar(host, 'pos'));
	let text1Value = getVar(host, 'item');
	const text1 = insert(injector2, text(text1Value));

	exitScope(host);

	return function partialButtonUpdate(vars) {
		enterScope(host, preparePartialItemVars(vars));
		attr1Value = updateAttribute(li, 'pos', getVar(host, 'pos'), attr1Value);
		text1Value = updateText(text1, getVar(host, 'item'), text1Value);
		exitScope(host);
	};
}

function forEachExpr1(host) {
	return getProp(host, 'items');
}

function forEachBody1(host, injector) {
	const partial1 = getProp(host, 'partial:item') || partialItem;
	const updatePartial = partial1(host, injector, getPartialItemVars(host));

	return () => {
		updatePartial(getPartialItemVars(host));
	};
}
