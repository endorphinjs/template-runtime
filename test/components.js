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

		component.setProps({ value1: 0 });
		assert.equal(component.innerHTML, read('samples/set1/output2.html'));
	});
});
