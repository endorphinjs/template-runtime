import { createInjector, renderBlock, text, get } from '../../runtime';

export default function template(ctx, target) {
	const injector = createInjector(target);
	return renderBlock(ctx, injector, ifBlock1);
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

function ifContent1(ctx, injector) {
	return renderBlock(ctx, injector, ifBlock2);
}

function ifContent2(ctx, injector) {
	return renderBlock(ctx, injector, ifBlock3);
}

function ifContent3(ctx, injector) {
	injector.insert(text('test'));
}
