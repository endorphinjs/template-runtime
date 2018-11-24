import {
	createInjector, elem, getProp, addEvent, finalizeEvents
} from '../../runtime';

export default function template(host) {
	const target = host.componentView;
	const elem1 = target.appendChild(elem('main'));
	const injector = createInjector(elem1);

	const onClick1 = function(event) {
		host.component.definition.method1.call(this, getProp(host, 'foo'), getProp(host, 'bar'), event, host);
	};

	const onClick2 = function(event) {
		host.component.definition.method2.call(this, getProp(host, 'foo'), getProp(host, 'bar'), event, host);
	};

	addEvent(injector, 'click', onClick1);
	ifEvent(host, injector, onClick2);
	finalizeEvents(injector);

	return function updateTemplate(){
		addEvent(injector, 'click', onClick1);
		ifEvent(host, injector, onClick2);
		finalizeEvents(injector);
	};
}

function ifEvent(host, injector, handler) {
	if (getProp(host, 'c1')) {
		addEvent(injector, 'click', handler);
	}
}
