import {
	createInjector, elem, elemWithText, text, insert, getProp, getVar, get,
	mountBlock, updateBlock, mountIterator, updateIterator
} from '../../runtime';

export default function template(component) {
	const injector = createInjector(component.componentView);

	insert(injector, elemWithText('h1', 'Hello world'));
	const block1 = mountBlock(component, injector, ifBlock1);
	return () => {
		updateBlock(block1);
	};
}

function ifBlock1(host) {
	if (getProp(host, 'items')) {
		return ifContent1;
	}
}

function ifContent1(host, injector) {
	insert(injector, elemWithText('p', 'will iterate'));
	const elem1 = insert(injector, elem('ul'));
	const injector2 = createInjector(elem1);
	const iter1 = mountIterator(host, injector2, forEachExpr1, forEachBody1);

	return () => {
		updateIterator(iter1);
	};
}

function forEachExpr1(host) {
	return getProp(host, 'items');
}

function forEachBody1(host, injector) {
	const elem1 = insert(injector, elem('li'));
	const injector2 = createInjector(elem1);
	insert(injector2, text('item'));
	const block1 = mountBlock(host, injector2, ifBlock2);
	return () => {
		updateBlock(block1);
	};
}

function ifBlock2(host) {
	if (get(getVar(host, 'value'), 'marked')) {
		return ifContent2;
	}
}

function ifContent2(host, injector) {
	insert(injector, elemWithText('strong', '*'));
}
