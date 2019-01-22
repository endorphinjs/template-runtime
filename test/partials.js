import assert from 'assert';
import read from './assets/read-file';
import document from './assets/document';
import partials from './samples/partials';
import * as OuterComponent from './samples/set2/outer-component';
import { createComponent, mountComponent, updateComponent } from '../runtime';

describe('Partials', () => {
	before(() => global.document = document);
	after(() => delete global.document);

	it('basic', () => {
		const component = createComponent('my-component', {
			default: partials,
			props() {
				return {
					items: ['one', 'two', 'three']
				};
			}
		});

		mountComponent(component);
		assert.equal(component.innerHTML, read('fixtures/partials1.html'));
	});

	it('pass partial as prop', () => {
		const component = createComponent('outer-component', OuterComponent);

		mountComponent(component);
		assert.equal(component.innerHTML, read('./samples/set2/output1.html'));

		// Re-render: keep everything as is
		updateComponent(component);
		assert.equal(component.innerHTML, read('./samples/set2/output1.html'));

		component.setProps({
			items1: ['four', 'five'],
			items2: [4, 5, 6, 7]
		});
		assert.equal(component.innerHTML, read('./samples/set2/output2.html'));
	});
});
