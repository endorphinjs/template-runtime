import assert from 'assert';
import document from './assets/document';
import read from './assets/read-file';
import * as MyComponent from './samples/set1/my-component';
import { createComponent, mountComponent } from '../runtime';

describe('Full component render', () => {
	before(() => global.document = document);
	after(() => delete global.document);

	it('set1', () => {
		const component = createComponent('my-component', MyComponent);

		mountComponent(component);
		assert.equal(component.innerHTML, read('samples/set1/output1.html'));

		const sub1 = component.findByName('sub-component1');
		const sub2 = component.findByName('sub-component2');
		assert(component.store);
		assert(sub1);
		assert(sub2);

		assert.strictEqual(sub1.root, component);
		assert.strictEqual(sub1.store, component.store);
		assert.strictEqual(sub2.root, component);
		assert.strictEqual(sub2.store, component.store);

		component.setProps({ value1: 0 });
		assert.equal(component.innerHTML, read('samples/set1/output2.html'));
	});
});
