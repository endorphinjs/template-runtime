import {
	createInjector, elem, getProp, insert, mountBlock, updateBlock,
	finalizeRefs, setRef, setStaticRef
} from '../../runtime';

export default function(component) {
	const injector = createInjector(component.componentView);

	const elem1 = insert(injector, elem('main', component));
	setStaticRef(component, 'main', elem1);

	const injector2 = createInjector(elem1);
	const elem2 = insert(injector2, elem('div', component));
	setRef(component, 'header', elem2);

	const block1 = mountBlock(component, injector2, ifBlock1);

	const elem3 = insert(injector2, elem('footer', component));
	setRef(component, getProp(component, 'dynRef'), elem3);

	finalizeRefs(component);

	return () => {
		setRef(component, 'header', elem2);
		updateBlock(block1);
		setRef(component, getProp(component, 'dynRef'), elem3);
		finalizeRefs(component);
	};
}

function ifBlock1(host) {
	if (getProp(host, 'c1')) {
		return ifContent1;
	}
}

function ifContent1(host, injector) {
	const cssScope = host.css;
	const elem1 = insert(injector, elem('span', cssScope));
	setRef(host, 'header', elem1);

	return () => {
		setRef(host, 'header', elem1);
	};
}
