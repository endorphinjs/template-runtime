import { elemWithText } from '../../../runtime';

/**
 * @param {Component} component
 */
export default function subComponent2Template(component) {
	const target = component.element.componentView;

	target.appendChild(elemWithText('p', 'sub-component 1', component));
}
