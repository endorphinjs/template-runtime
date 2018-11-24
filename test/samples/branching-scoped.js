import {
	createInjector, elem, elemWithText, text, insert, getProp, mountBlock, updateBlock
} from '../../runtime';

export default function(component) {
	const target = component.componentView;
	const injector = createInjector(target || component);
	insert(injector, elemWithText('h1', 'Hello world', component));

	const block1 = mountBlock(component, injector, ifBlock1);
	const elem1 = insert(injector, elem('blockquote', component));
	const injector2 = createInjector(elem1);
	insert(injector2, elemWithText('p', 'Lorem ipsum 1', component));

	const block2 = mountBlock(component, injector2, chooseBlock1);
	insert(injector2, elemWithText('p', 'Lorem ipsum 2', component));

	return () => {
		updateBlock(block1);
		updateBlock(block2);
	};
}

function ifBlock1(host) {
	if (getProp(host, 'expr1')) {
		return ifContent1;
	}
}

function ifBlock2(host) {
	if (getProp(host, 'expr2')) {
		return ifContent2;
	}
}

function ifBlock3(host) {
	if (getProp(host, 'expr3')) {
		return ifContent3;
	}
}

function chooseBlock1(host) {
	if (getProp(host, 'expr1') === 1) {
		return chooseContent1;
	} else if (getProp(host, 'expr1') === 2) {
		return chooseContent2;
	} else {
		return chooseContent3;
	}
}

function ifContent1(host, injector) {
	const p = insert(injector, elem('p', host));
	p.appendChild(elemWithText('strong', 'top 1', host));
	const block1 = mountBlock(host, injector, ifBlock2);
	const block2 = mountBlock(host, injector, ifBlock3);

	return () => {
		updateBlock(block1);
		updateBlock(block2);
	};
}

function ifContent2(host, injector) {
	insert(injector, elemWithText('div', 'top 2', host));
}

function ifContent3(host, injector) {
	insert(injector, elemWithText('div', 'top 3', host));
	insert(injector, text('top 3.1', host));
}

function chooseContent1(host, injector) {
	insert(injector, elemWithText('div', 'sub 1', host));
}

function chooseContent2(host, injector) {
	insert(injector, elemWithText('div', 'sub 2', host));
}

function chooseContent3(host, injector) {
	insert(injector, elemWithText('div', 'sub 3', host));
}
