import assert from 'assert';
import document from './assets/document';
import template from './samples/events';
import { createComponent, mountComponent } from '../runtime';

describe('Event handler', () => {
	// TODO add tests for static events
	// TODO add tests for loops and local variables

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
});
