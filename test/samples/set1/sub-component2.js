import { elemWithText } from '../../../runtime';

/**
 * @param {ComponentContainer} component
 */
export default function subComponent2Template(component) {
	const target = component.element.componentView;
	const { scope } = component;
	const cssScope = scope.css;

	target.appendChild(elemWithText('p', 'sub-component 1', cssScope));
	return function subComponent2Update() {};
}
