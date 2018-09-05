import renderBlock from '../lib/block.js';

export default function template(ctx, injector) {
	const h1 = document.createElement('h1');
	h1.textContent = 'title';

	injector.insert(h1);

	const injector1 = injector.create(injector.parentNode, h1);
	const block1 = renderBlock(templateIf1Condition, ctx, injector1);

	const injector2 = injector1.fork();
	const block2 = renderBlock(templateIf2Condition, ctx, injector2);

	const p = document.createElement('p');
	p.textContent = 'Body';
	injector.insert(p);

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

function templateIf1Body(ctx, injector) {
	const el1 = document.createElement('div');
	el1.textContent = 'Item 1';

	injector.insert(el1);

	const el2 = document.createElement('div');
	el1.textContent = 'Item 2';

	injector.insert(el2);
}

function templateIf2Condition(ctx) {
	if (ctx.get('bar')) {
		return templateIf2Body;
	}
}

function templateIf2Body(ctx, injector) {
	const el1 = document.createElement('div');
	el1.textContent = 'Item 3';

	injector.insert(el1);

	const el2 = document.createElement('div');
	el1.textContent = 'Item 4';

	injector.insert(el2);
}
