import assert from 'assert';
import document from './assets/document';
import { Store } from '../lib/store';
import storeTemplate from './samples/store';
import { createComponent, mountComponent, unmountComponent } from '../runtime';

describe('Store', () => {
	before(() => global.document = document);
	after(() => delete global.document);

	it('should set & get value', () => {
		const store = new Store();
		assert.deepEqual(store.get(), {});

		store.set({ foo: 'bar' });
		assert.equal(store.get().foo, 'bar');

		store.set(null);
		assert.equal(store.get().foo, 'bar');
	});

	it('should notify subscribers', () => {
		const store = new Store({ a: 0, b: 0, c: 0 });
		const a = [];
		const b = [];
		const c = [];

		const entry1 = store.subscribe(data => a.push(data.a));
		store.subscribe(data => b.push(data.b), ['b']);
		store.subscribe(data => c.push(data.c), ['a', 'c']);

		store.set({ a: 1 });
		assert.deepEqual(a, [1]);
		assert.deepEqual(b, []);
		assert.deepEqual(c, [0]);

		// Setting the same value should not trigger update
		store.set({ a: 1 });
		assert.deepEqual(a, [1]);
		assert.deepEqual(b, []);
		assert.deepEqual(c, [0]);

		store.set({ b: 10 });
		assert.deepEqual(a, [1, 1]);
		assert.deepEqual(b, [10]);
		assert.deepEqual(c, [0]);

		store.unsubscribe(entry1);
		store.set({ c: 100 });
		assert.deepEqual(a, [1, 1]);
		assert.deepEqual(b, [10]);
		assert.deepEqual(c, [0, 100]);
	});

	it('should auto-update component', () => {
		let renderCount = 0;
		const store = new Store({ foo: 'bar' });
		store.sync = true;
		const component = createComponent('my-component', {
			default: storeTemplate,
			store() {
				return store;
			},
			willRender() {
				renderCount++;
			}
		});

		// Initial render
		mountComponent(component);
		assert.equal(component.innerHTML, '<div>\n\t<p>\n\t\tStore value is \n\t\tbar\n\t</p>\n</div>');
		assert.equal(renderCount, 1);
		assert.equal(store._listeners.length, 1);

		store.set({ foo: 'baz' });
		assert.equal(component.innerHTML, '<div>\n\t<p>\n\t\tStore value is \n\t\tbaz\n\t</p>\n</div>');
		assert.equal(renderCount, 2);
		assert.equal(store._listeners.length, 1);

		// Other values should not trigger updated
		store.set({ a: 'b' });
		assert.equal(component.innerHTML, '<div>\n\t<p>\n\t\tStore value is \n\t\tbaz\n\t</p>\n</div>');
		assert.equal(renderCount, 2);
		assert.equal(store._listeners.length, 1);

		// Should not trigger updates for unmounted components
		unmountComponent(component);
		store.set({ foo: 'bam' });
		assert.equal(component.innerHTML, '<div>\n\t<p>\n\t\tStore value is \n\t\tbaz\n\t</p>\n</div>');
		assert.equal(renderCount, 2);
		assert.equal(store._listeners.length, 0);
	});
});
