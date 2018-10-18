import {
	createInjector, elem, elemWithText,
	text, insert, createScope, getProp, getVar, get,
	mountBlock, updateBlock, mountIterator, updateIterator
} from '../../runtime';

export default function template(component) {
	const scope = createScope(component);
	const injector = createInjector(component);

	insert(injector, elemWithText('h1', 'Hello world'));
	const block1 = mountBlock(scope, injector, ifBlock1);
	return () => {
		updateBlock(block1);
	};
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
	const iter1 = mountIterator(scope, injector2, forEachExpr1, forEachBody1);

	return () => {
		updateIterator(iter1);
	};
}

function forEachExpr1(scope) {
	return getProp(scope, 'items');
}

function forEachBody1(scope, injector) {
	const elem1 = insert(injector, elem('li'));
	const injector2 = createInjector(elem1);
	insert(injector2, text('item'));
	const block1 = mountBlock(scope, injector2, ifBlock2);
	return () => {
		updateBlock(block1);
	};
}

function ifBlock2(scope) {
	if (get(getVar(scope, 'value'), 'marked')) {
		return ifContent2;
	}
}

function ifContent2(scope, injector) {
	insert(injector, elemWithText('strong', '*'));
}
