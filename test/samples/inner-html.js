import {
	createInjector, createScope, getProp, insert, renderBlock,
	mountInnerHTML, updateInnerHTML, elemWithText
} from '../../runtime';

export default function(component) {
	const scope = createScope(component);
	const injector = createInjector(component);
	const block1 = renderBlock(scope, injector, ifBlock1);
	const html1 = mountInnerHTML(scope, injector, getHTML);
	const block2 = renderBlock(scope, injector, ifBlock2);

	return () => {
		block1();
		updateInnerHTML(scope, injector, html1);
		block2();
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
