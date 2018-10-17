import {
	createInjector, renderBlock, text, insert, createScope, getProp,
	mountBlock, updateBlock
} from '../../runtime';

export default function template(component, target) {
	const scope = createScope(component);
	const injector = createInjector(target || component);
	const block = mountBlock(scope, injector, ifBlock1);

	return () => {
		updateBlock(block);
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

function ifContent1(scope, injector) {
	const block = mountBlock(scope, injector, ifBlock2);

	return () => {
		updateBlock(block);
	};
}

function ifContent2(scope, injector) {
	const block = mountBlock(scope, injector, ifBlock3);

	return () => {
		updateBlock(block);
	};
}

function ifContent3(scope, injector) {
	insert(injector, text('test'));
}
