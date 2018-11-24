import {
	createInjector, text, insert, getProp, mountBlock, updateBlock
} from '../../runtime';

export default function template(component) {
	const target = component.componentView;
	const injector = createInjector(target || component);
	const block = mountBlock(component, injector, ifBlock1);

	return () => {
		updateBlock(block);
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

function ifContent1(host, injector) {
	const block = mountBlock(host, injector, ifBlock2);

	return () => {
		updateBlock(block);
	};
}

function ifContent2(host, injector) {
	const block = mountBlock(host, injector, ifBlock3);

	return () => {
		updateBlock(block);
	};
}

function ifContent3(host, injector) {
	insert(injector, text('test'));
}
