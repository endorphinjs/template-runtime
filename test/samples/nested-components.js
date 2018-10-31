import {
	elemWithText, text, insert, createScope,
	createComponent, mountComponent, updateComponent,
	setAttribute, getProp
} from '../../runtime';

/**
 * @param {ComponentContainer} component
 */
export default function template(component) {
	const scope = createScope(component);
	const cssScope = scope.css;
	const { injector } = component;

	insert(injector, elemWithText('h1', 'Title'));

	const subComponent1 = createComponent('sub-component1', component.definition.components.SubComponent1, cssScope);
	const injector2 = subComponent1.injector;
	setAttribute(injector2, 'foo', attrValue1(scope));
	insert(injector, subComponent1.element);

	const subComponent2 = createComponent('sub-component2', component.definition.components.SubComponent2, cssScope);
	const injector3 = subComponent2.injector;
	setAttribute(injector3, 'bar', attrValue2(scope));
	insert(injector2, subComponent2.element);

	insert(injector3, text('Hello world'));

	mountComponent(subComponent2);
	mountComponent(subComponent1);

	return () => {
		setAttribute(injector2, 'foo', attrValue1(scope));
		setAttribute(injector3, 'bar', attrValue2(scope));
		updateComponent(subComponent2);
		updateComponent(subComponent1);
	};
}

function attrValue1(scope) {
	return getProp(scope, 'value1');
}

function attrValue2(scope) {
	return getProp(scope, 'value2');
}
