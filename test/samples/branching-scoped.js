import {
	createInjector, elem, elemWithText, text, insert, getProp, mountBlock, updateBlock
} from '../../runtime';

export default function(component, scope) {
	const target = component.componentView;
	const injector = createInjector(target);
	insert(injector, elemWithText('h1', 'Hello world', component));

	scope.block1 = mountBlock(component, injector, ifBlock1);
	const elem1 = insert(injector, elem('blockquote', component));
	const injector2 = createInjector(elem1);
	insert(injector2, elemWithText('p', 'Lorem ipsum 1', component));

	scope.block2 = mountBlock(component, injector2, chooseBlock1);
	insert(injector2, elemWithText('p', 'Lorem ipsum 2', component));

	return updateTemplate;
}

function updateTemplate(host, scope) {
	updateBlock(scope.block1);
	updateBlock(scope.block2);
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

function ifContent1(host, injector, scope) {
	const p = insert(injector, elem('p', host));
	p.appendChild(elemWithText('strong', 'top 1', host));
	scope.block3 = mountBlock(host, injector, ifBlock2);
	scope.block4 = mountBlock(host, injector, ifBlock3);
	return ifContent1Update;
}

function ifContent1Update(host, injector, scope) {
	updateBlock(scope.block3);
	updateBlock(scope.block4);
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
