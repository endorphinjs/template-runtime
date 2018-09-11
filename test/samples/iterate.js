import {
	createInjector, renderBlock, renderIterator, elem, elemWithText,
	text, insert, createScope, getProp, getVar, get
} from '../../runtime';

export default function template(component, target) {
	const scope = createScope(component);
	const injector = createInjector(target || component);
	insert(injector, elemWithText('h1', 'Hello world'));
	return renderBlock(scope, injector, ifBlock1);
}

function ifBlock1(scope) {
	if (getProp(scope, 'items')) {
		return ifContent1;
	}
}

function ifContent1(scope, injector) {
	insert(injector, elemWithText('p', 'will iterate'));
	const elem1 = insert(injector, elem('ul'));
	const injector2 = createInjector(elem1);

	return renderIterator(scope, injector2, forEachExpr1, forEachBody1);
}

function forEachExpr1(scope) {
	return getProp(scope, 'items');
}

function forEachBody1(scope, injector) {
	const elem1 = insert(injector, elem('li'));
	const injector2 = createInjector(elem1);
	insert(injector2, text('item'));
	return renderBlock(scope, injector2, ifBlock2);
}

function ifBlock2(scope) {
	if (get(getVar(scope, 'value'), 'marked')) {
		return ifContent2;
	}
}

function ifContent2(scope, injector) {
	insert(injector, elemWithText('strong', '*'));
}
