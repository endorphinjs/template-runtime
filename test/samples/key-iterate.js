import {
	createInjector, renderBlock, renderKeyIterator, elem, elemWithText,
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

	return renderKeyIterator(ctx, injector2, forEachExpr1, forEachKey1, forEachBody1);
}

function forEachExpr1(ctx) {
	return get(ctx, 'items');
}

function forEachKey1(ctx) {
	return get(ctx, 'id');
}

function forEachBody1(ctx, injector) {
	const elem1 = insert(injector, elem('li'));
	const attr1Expr = ctx => elem1.setAttribute('id', get(ctx, 'id'));
	attr1Expr(ctx);
	const injector2 = createInjector(elem1);
	insert(injector2, text('item'));
	const block1 = renderBlock(ctx, injector2, ifBlock2);

	return ctx => {
		attr1Expr(ctx);
		block1(ctx);
	};
}

function ifBlock2(ctx) {
	if (get(ctx, 'marked')) {
		return ifContent2;
	}
}

function ifContent2(ctx, injector) {
	insert(injector, elemWithText('strong', '*'));
}
