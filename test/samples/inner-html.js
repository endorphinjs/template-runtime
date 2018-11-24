import {
	createInjector, elemWithText, getProp, insert,
	mountInnerHTML, updateInnerHTML, mountBlock, updateBlock
} from '../../runtime';

export default function(component) {
	const injector = createInjector(component.componentView);
	const block1 = mountBlock(component, injector, ifBlock1);
	const html1 = mountInnerHTML(component, injector, getHTML);
	const block2 = mountBlock(component, injector, ifBlock2);

	return () => {
		updateBlock(block1);
		updateInnerHTML(html1);
		updateBlock(block2);
	};
}

function getHTML(host) {
	return getProp(host, 'html');
}

function ifBlock1(host) {
	if (getProp(host, 'c1')) {
		return ifContent1;
	}
}

function ifContent1(host, injector) {
	insert(injector, elemWithText('div', 'foo', host));
}

function ifBlock2(host) {
	if (getProp(host, 'c2')) {
		return ifContent2;
	}
}

function ifContent2(host, injector) {
	insert(injector, elemWithText('p', 'bar', host));
}
