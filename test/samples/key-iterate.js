import {
	createInjector, mountKeyIterator, updateKeyIterator, elem, elemWithText,
	text, get, insert, createScope, getProp, getVar,
	mountBlock, updateBlock
} from '../../runtime';

export default function template(component, target) {
	const scope = createScope(component);
	const injector = createInjector(target || component);
	insert(injector, elemWithText('h1', 'Hello world'));
	const block = mountBlock(scope, injector, ifBlock1);
	return () => {
		updateBlock(block);
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
	const iter1 = mountKeyIterator(scope, injector2, forEachExpr1, forEachKey1, forEachBody1);

	return () => {
		updateKeyIterator(iter1);
	};
}

function forEachExpr1(scope) {
	return getProp(scope, 'items');
}

function forEachKey1(ctx) {
	return get(ctx, 'id');
}

function forEachBody1(scope, injector) {
	const elem1 = insert(injector, elem('li'));
	const attr1Expr = () => elem1.setAttribute('id', get(getVar(scope, 'value'), 'id'));
	attr1Expr(scope);
	const injector2 = createInjector(elem1);
	insert(injector2, text('item'));
	const block1 = mountBlock(scope, injector2, ifBlock2);

	return () => {
		attr1Expr(scope);
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
