import assert from 'assert';
import document from './assets/document';
import events from './samples/events';

describe('Event handler', () => {
	before(() => global.document = document);
	after(() => delete global.document);

	it('should add and call event handler', () => {
		const calls = {
			method1: [],
			method2: []
		};
		const component = document.createElement('div');
		component.method1 = (arg1, arg2, evt) => {
			assert.strictEqual(evt.type, 'click');
			calls.method1.push([arg1, arg2]);
		};

		component.method2 = (arg1, arg2, evt) => {
			assert.strictEqual(evt.type, 'click');
			calls.method2.push([arg1, arg2]);
		};

		component.setProps({ foo: 'foo1', bar: 'bar2', c1: false });

		const update = events(component);

		// Initial render
		component.firstChild.dispatchEvent({ type: 'click' });
		assert.equal(component.innerHTML, '<main></main>');
		assert.deepEqual(calls.method1, [['foo1', 'bar2']]);
		assert.deepEqual(calls.method2, []);

		// Re-run template: nothing should change
		update();
		component.firstChild.dispatchEvent({ type: 'click' });
		assert.equal(component.innerHTML, '<main></main>');
		assert.deepEqual(calls.method1, [['foo1', 'bar2'], ['foo1', 'bar2']]);
		assert.deepEqual(calls.method2, []);

		// Bind new listener
		component.setProps({ foo: 'foo3', bar: 'bar4', c1: true });
		update();
		component.firstChild.dispatchEvent({ type: 'click' });
		assert.equal(component.innerHTML, '<main></main>');
		assert.deepEqual(calls.method1, [['foo1', 'bar2'], ['foo1', 'bar2']]);
		assert.deepEqual(calls.method2, [['foo3', 'bar4']]);

	});
});
