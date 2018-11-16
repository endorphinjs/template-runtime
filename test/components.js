import assert from 'assert';
import document from './assets/document';
import read from './assets/read-file';
import * as MyComponent from './samples/set1/my-component';
import { createComponent, mountComponent } from '../runtime';

describe('Full component render', () => {
	before(() => global.document = document);
	after(() => delete global.document);

	it.only('set1', () => {
		const component = createComponent('my-component', MyComponent);
		const { element } = component;

		mountComponent(component);
		assert.equal(element.innerHTML, read('samples/set1/output1.html'));

		element.setProps({ value1: 0 });
		assert.equal(element.innerHTML, read('samples/set1/output2.html'));
	});
});
