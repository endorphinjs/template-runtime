import { createInjector, renderBlock, text, insert, createScope, getProp } from '../../runtime';

export default function template(component, target) {
	const scope = createScope(component);
	const injector = createInjector(target || component);
	return renderBlock(scope, injector, ifBlock1);
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
	return renderBlock(scope, injector, ifBlock2);
}

function ifContent2(scope, injector) {
	return renderBlock(scope, injector, ifBlock3);
}

function ifContent3(scope, injector) {
	insert(injector, text('test'));
}
