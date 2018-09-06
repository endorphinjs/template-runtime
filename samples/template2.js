import { createInjector, renderBlock, noop, elemWithText } from '../runtime';

/**
 * @param {Context} ctx
 * @param {Element} target
 */
export default function template(ctx, target) {
	const injector = createInjector(target);

	injector.insert(elemWithText('h1', 'title'));
	const block1 = renderBlock(ctx, injector, templateIf1Condition);
	const block2 = renderBlock(ctx, injector, templateIf2Condition);
	injector.insert(elemWithText('p', 'Body'));

	return ctx => {
		block1(ctx);
		block2(ctx);
	};
}

function templateIf1Condition(ctx) {
	if (ctx.get('foo')) {
		return templateIf1Body;
	}
}

function templateIf2Condition(ctx) {
	if (ctx.get('bar')) {
		return templateIf2Body;
	}
}

function templateIf1Body(ctx, target) {
	const injector = createInjector(target);
	injector.insert(elemWithText('div', 'Item 1'));
	injector.insert(elemWithText('div', 'Item 2'));
	return noop;
}

function templateIf2Body(ctx, target) {
	const injector = createInjector(target);
	injector.insert(elemWithText('div', 'Item 3'));
	injector.insert(elemWithText('div', 'Item 4'));
	return noop;
}
