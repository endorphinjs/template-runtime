import assert from 'assert';
import read from './assets/read-file';
import document, { setCallback, clearCallbacks } from './assets/document';
import parentTemplate from './samples/slot';
import { createComponent, mountComponent } from '../runtime';

describe('Slots', () => {
	before(() => global.document = document);
	after(() => {
		delete global.document;
		clearCallbacks();
	});

	it('should render slotted component', () => {
		let subComponent;
		const component = createComponent('my-component', {
			default: parentTemplate,
			props() {
				return { id: 'foo', c1: false, c2: false };
			}
		});

		setCallback(elem => {
			if (elem.nodeName === 'sub-component') {
				subComponent = elem;
			}
		});

		// Initial render
		mountComponent(component);
		assert.equal(component.innerHTML, read('./fixtures/slot1.html'));
		assert(subComponent);

		component.setProps({ c1: true, c2: true });
		assert.equal(component.innerHTML, read('./fixtures/slot2.html'));

		// Dispose incoming "header" slot: should render default value
		component.setProps({ c2: false });
		assert.equal(component.innerHTML, read('./fixtures/slot3.html'));

		// Set back incoming "header" slot
		component.setProps({ c2: true });
		assert.equal(component.innerHTML, read('./fixtures/slot2.html'));

		// Fill slot contents with iterator
		component.setProps({ items: [1, 2] });
		assert.equal(component.innerHTML, read('./fixtures/slot4.html'));

		// Enable "footer" slot in sub-component
		subComponent.setProps({ showFooter: true });
		assert.equal(component.innerHTML, read('./fixtures/slot5.html'));

		// Disable "footer" slot
		subComponent.setProps({ showFooter: false });
		assert.equal(component.innerHTML, read('./fixtures/slot4.html'));

		// ...and enable "footer" slot back again
		subComponent.setProps({ showFooter: true });
		assert.equal(component.innerHTML, read('./fixtures/slot5.html'));

		// Re-render the same template: keep data as-is
		component.componentModel.update();
		assert.equal(component.innerHTML, read('./fixtures/slot5.html'));

		// Dispose data rendered in iterator
		component.setProps({ items: null });
		assert.equal(component.innerHTML, read('./fixtures/slot6.html'));
	});
});
