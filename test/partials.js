import assert from 'assert';
import read from './assets/read-file';
import document from './assets/document';
import partials from './samples/partials';
import { createComponent, mountComponent } from '../runtime';

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
});
