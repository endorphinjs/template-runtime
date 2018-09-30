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

	addEvent(injector, 'click', onClick1);
	const event1 = ifEvent(scope, injector);
	finalizeEvents(injector);

	return () => {
		addEvent(injector, 'click', onClick1);
		event1();
		finalizeEvents(injector);
	};
}

function ifEvent(scope, injector) {
	function onClick2(event) {
		scope.component.method2(getProp(scope, 'foo'), getProp(scope, 'bar'), event);
	}

	const update = () => {
		if (getProp(scope, 'c1')) {
			addEvent(injector, 'click', onClick2);
		}
		return update;
	};

	return update();
}
