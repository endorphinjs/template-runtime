import { elem, text, updateText, subscribeStore } from '../../runtime';

export default function template(host, scope) {
	const target = host.componentView;
	const div = target.appendChild(elem('div'));
	const p = div.appendChild(elem('p'));
	p.appendChild(text('Store value is '));
	scope.text0 = p.appendChild(text(scope.textValue0 = host.store.data.foo));
	subscribeStore(host, ['foo']);
	return updateTemplate;
}

function updateTemplate(host, scope) {
	scope.textValue0 = updateText(scope.text0, host.store.data.foo, scope.textValue0);
}
