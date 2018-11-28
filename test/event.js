import assert from 'assert';
import document from './assets/document';
import template from './samples/events';
import loopTemplate from './samples/events-loop';
import { createComponent, mountComponent } from '../runtime';

describe('Event handler', () => {
	// TODO add tests for static events

	before(() => global.document = document);
	after(() => delete global.document);

	it('should add and call event handler', () => {
		const calls = {
			method1: [],
			method2: []
		};

		const component = createComponent('my-component', {
			default: template,
			props() {
				return { foo: 'foo1', bar: 'bar2', c1: false };
			},
			method1(arg1, arg2, evt) {
				assert.strictEqual(evt.type, 'click');
				calls.method1.push([arg1, arg2]);
			},
			method2(arg1, arg2, evt) {
				assert.strictEqual(evt.type, 'click');
				calls.method2.push([arg1, arg2]);
			}
		});

		// Initial render
		mountComponent(component);
		component.firstChild.dispatchEvent({ type: 'click' });
		assert.equal(component.innerHTML, '<main></main>');
		assert.deepEqual(calls.method1, [['foo1', 'bar2']]);
		assert.deepEqual(calls.method2, []);

		// Re-run template: nothing should change
		component.component.update();
		component.firstChild.dispatchEvent({ type: 'click' });
		assert.equal(component.innerHTML, '<main></main>');
		assert.deepEqual(calls.method1, [['foo1', 'bar2'], ['foo1', 'bar2']]);
		assert.deepEqual(calls.method2, []);

		// Bind new listener
		component.setProps({ foo: 'foo3', bar: 'bar4', c1: true });
		component.firstChild.dispatchEvent({ type: 'click' });
		assert.equal(component.innerHTML, '<main></main>');
		assert.deepEqual(calls.method1, [['foo1', 'bar2'], ['foo1', 'bar2']]);
		assert.deepEqual(calls.method2, [['foo3', 'bar4']]);
	});

	it('should add and call event handler in loops', () => {
		const calls = [];

		const component = createComponent('my-component', {
			default: loopTemplate,
			props() {
				return {
					items: [1, 2, 3]
				};
			},
			handleClick(arg1, arg2, arg3, evt) {
				assert.strictEqual(evt.type, 'click');
				calls.push([arg1, arg2, arg3]);
			}
		});

		// Initial render
		mountComponent(component);
		component.firstChild.childNodes[0].dispatchEvent({ type: 'click' });
		component.firstChild.childNodes[1].dispatchEvent({ type: 'click' });
		assert.equal(component.innerHTML, '<ul>\n\t<li>item</li>\n\t<li>item</li>\n\t<li>item</li>\n</ul>');
		assert.deepEqual(calls, [[0, 2, 1], [1, 2, 1]]);

		// Re-run template: nothing should change
		component.component.update();
		component.firstChild.childNodes[0].dispatchEvent({ type: 'click' });
		component.firstChild.childNodes[1].dispatchEvent({ type: 'click' });
		assert.equal(component.innerHTML, '<ul>\n\t<li>item</li>\n\t<li>item</li>\n\t<li>item</li>\n</ul>');
		assert.deepEqual(calls, [[0, 2, 1], [1, 2, 1], [0, 2, 1], [1, 2, 1]]);
	});
});
