import {
	createInjector, elem, createScope, getProp, insert, renderBlock,
	finalizeRefs, setRef, setStaticRef
} from '../../runtime';

export default function(component) {
	const scope = createScope(component);
	const injector = createInjector(component);
	const cssScope = scope.css;

	const elem1 = insert(injector, elem('main', cssScope));
	setStaticRef(scope, 'main', elem1);

	const injector2 = createInjector(elem1);
	const elem2 = insert(injector2, elem('div', cssScope));
	setRef(scope, 'header', elem2);

	const block1 = renderBlock(scope, injector2, ifBlock1);

	const elem3 = insert(injector2, elem('footer', cssScope));
	setRef(scope, getProp(scope, 'dynRef'), elem3);

	finalizeRefs(scope);

	return () => {
		setRef(scope, 'header', elem2);
		block1();
		setRef(scope, getProp(scope, 'dynRef'), elem3);
		finalizeRefs(scope);
	};
}

function ifBlock1(scope) {
	if (getProp(scope, 'c1')) {
		return ifContent1;
	}
}

function ifContent1(scope, injector) {
	const cssScope = scope.css;
	const elem1 = insert(injector, elem('span', cssScope));
	setRef(scope, 'header', elem1);

	return () => {
		setRef(scope, 'header', elem1);
	};
}
