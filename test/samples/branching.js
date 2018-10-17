import {
	createInjector, elem, elemWithText, text, insert, createScope, getProp,
	mountBlock, updateBlock
} from '../../runtime';

export default function(component, target) {
	const scope = createScope(component);
	const injector = createInjector(target || component);
	insert(injector, elemWithText('h1', 'Hello world'));
	const block1 = mountBlock(scope, injector, ifBlock1);

	const elem1 = insert(injector, elem('blockquote'));
	const injector2 = createInjector(elem1);
	insert(injector2, elemWithText('p', 'Lorem ipsum 1'));
	const block2 = mountBlock(scope, injector2, chooseBlock1);
	insert(injector2, elemWithText('p', 'Lorem ipsum 2'));

	return () => {
		updateBlock(block1);
		updateBlock(block2);
	};
}

function ifBlock1(scope) {
	if (getProp(scope, 'expr1')) {
		return ifContent1;
	}
}

function ifBlock2(scope) {
	if (getProp(scope, 'expr2')) {
		return ifContent2;
	}
}

function ifBlock3(scope) {
	if (getProp(scope, 'expr3')) {
		return ifContent3;
	}
}

function chooseBlock1(scope) {
	if (getProp(scope, 'expr1') === 1) {
		return chooseContent1;
	} else if (getProp(scope, 'expr1') === 2) {
		return chooseContent2;
	} else {
		return chooseContent3;
	}
}

function ifContent1(scope, injector) {
	const p = insert(injector, elem('p'));
	p.appendChild(elemWithText('strong', 'top 1'));
	const block1 = mountBlock(scope, injector, ifBlock2);
	const block2 = mountBlock(scope, injector, ifBlock3);

	return () => {
		updateBlock(block1);
		updateBlock(block2);
	};
}

function ifContent2(scope, injector) {
	insert(injector, elemWithText('div', 'top 2'));
}

function ifContent3(scope, injector) {
	insert(injector, elemWithText('div', 'top 3'));
	insert(injector, text('top 3.1'));
}

function chooseContent1(scope, injector) {
	insert(injector, elemWithText('div', 'sub 1'));
}

function chooseContent2(scope, injector) {
	insert(injector, elemWithText('div', 'sub 2'));
}

function chooseContent3(scope, injector) {
	insert(injector, elemWithText('div', 'sub 3'));
}
