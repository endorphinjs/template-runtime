import {
	createInjector, createScope, elemWithText, getProp, insert,
	mountInnerHTML, updateInnerHTML, mountBlock, updateBlock
} from '../../runtime';

export default function(component) {
	const scope = createScope(component);
	const injector = createInjector(component);
	const block1 = mountBlock(scope, injector, ifBlock1);
	const html1 = mountInnerHTML(scope, injector, getHTML);
	const block2 = mountBlock(scope, injector, ifBlock2);

	return () => {
		updateBlock(block1);
		updateInnerHTML(html1);
		updateBlock(block2);
	};
}

function getHTML(scope) {
	return getProp(scope, 'html');
}

function ifBlock1(scope) {
	if (getProp(scope, 'c1')) {
		return ifContent1;
	}
}

function ifContent1(scope, injector) {
	insert(injector, elemWithText('div', 'foo', scope.css));
}

function ifBlock2(scope) {
	if (getProp(scope, 'c2')) {
		return ifContent2;
	}
}

function ifContent2(scope, injector) {
	insert(injector, elemWithText('p', 'bar', scope.css));
}
