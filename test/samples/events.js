import {
	createInjector, elem, createScope, getProp,
	addEvent, finalizeEvents
} from '../../runtime';

export default function (component, target = component) {
	const scope = createScope(component);
	const elem1 = target.appendChild(elem('main'));
	const injector = createInjector(elem1);

	function onClick1(event) {
		scope.component.method1(getProp(scope, 'foo'), getProp(scope, 'bar'), event);
	}

	function onClick2(event) {
		scope.component.method2(getProp(scope, 'foo'), getProp(scope, 'bar'), event);
	}

	addEvent(injector, 'click', onClick1);
	ifEvent(scope, injector, onClick2);
	finalizeEvents(injector);

	return () => {
		addEvent(injector, 'click', onClick1);
		ifEvent(scope, injector, onClick2);
		finalizeEvents(injector);
	};
}

function ifEvent(scope, injector, handler) {
	if (getProp(scope, 'c1')) {
		addEvent(injector, 'click', handler);
	}
}
