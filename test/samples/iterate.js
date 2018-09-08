import {
	createInjector, renderBlock, renderIterator, elem, elemWithText,
	text, get, insert
} from '../../runtime';

export default function template(ctx, target) {
	const injector = createInjector(target);
	insert(injector, elemWithText('h1', 'Hello world'));
	return renderBlock(ctx, injector, ifBlock1);
}

function ifBlock1(ctx) {
	if (get(ctx, 'items')) {
		return ifContent1;
	}
}

function ifContent1(ctx, injector) {
	insert(injector, elemWithText('p', 'will iterate'));
	const elem1 = insert(injector, elem('ul'));
	const injector2 = createInjector(elem1);

	return renderIterator(ctx, injector2, forEachExpr1, forEachBody1);
}

function forEachExpr1(ctx) {
	return get(ctx, 'items');
}

function forEachBody1(ctx, injector) {
	const elem1 = insert(injector, elem('li'));
	const injector2 = createInjector(elem1);
	insert(injector2, text('item'));
	return renderBlock(ctx, injector2, ifBlock2);
}

function ifBlock2(ctx) {
	if (get(ctx, 'marked')) {
		return ifContent2;
	}
}

function ifContent2(ctx, injector) {
	insert(injector, elemWithText('strong', '*'));
}
