import {
	createInjector, renderBlock, elem, elemWithText,
	text, get
} from '../../runtime';

export default function(ctx, target) {
	const injector = createInjector(target);
	injector.insert(elemWithText('h1', 'Hello world'));
	const block1 = renderBlock(ctx, injector, ifBlock1);

	const elem1 = injector.insert(elem('blockquote'));
	const injector2 = createInjector(elem1);
	injector2.insert(elemWithText('p', 'Lorem ipsum 1'));
	const block2 = renderBlock(ctx, injector2, chooseBlock1);
	injector2.insert(elemWithText('p', 'Lorem ipsum 2'));

	return ctx => {
		block1(ctx);
		block2(ctx);
	};
}

function ifBlock1(ctx) {
	if (get(ctx, 'expr1')) {
		return ifContent1;
	}
}

function ifBlock2(ctx) {
	if (get(ctx, 'expr2')) {
		return ifContent2;
	}
}

function ifBlock3(ctx) {
	if (get(ctx, 'expr3')) {
		return ifContent3;
	}
}

function chooseBlock1(ctx) {
	if (get(ctx, 'expr1') === 1) {
		return chooseContent1;
	} else if (get(ctx, 'expr1') === 2) {
		return chooseContent2;
	} else {
		return chooseContent3;
	}
}

function ifContent1(ctx, injector) {
	const p = injector.insert(elem('p'));
	p.appendChild(elemWithText('strong', 'top 1'));
	const block1 = renderBlock(ctx, injector, ifBlock2);
	const block2 = renderBlock(ctx, injector, ifBlock3);

	return ctx => {
		block1(ctx);
		block2(ctx);
	};
}

function ifContent2(ctx, injector) {
	injector.insert(elemWithText('div', 'top 2'));
}

function ifContent3(ctx, injector) {
	injector.insert(elemWithText('div', 'top 3'));
	injector.insert(text('top 3.1'));
}

function chooseContent1(ctx, injector) {
	injector.insert(elemWithText('div', 'sub 1'));
}

function chooseContent2(ctx, injector) {
	injector.insert(elemWithText('div', 'sub 2'));
}

function chooseContent3(ctx, injector) {
	injector.insert(elemWithText('div', 'sub 3'));
}
