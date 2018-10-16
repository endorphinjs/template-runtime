import assert from 'assert';
import read from './assets/read-file';
import document, { setCallback, clearCallbacks } from './assets/document';
import parentTemplate, { subComponentTemplate } from './samples/slot';

describe('Slots', () => {
	before(() => global.document = document);
	after(() => {
		delete global.document;
		clearCallbacks();
	});

	it('should render slotted component', () => {
		const component = document.createElement('div');
		let subComponent, subComponentUpdate;
		setCallback(elem => {
			if (elem.nodeName === 'sub-component') {
				subComponent = elem;
				elem.render = slots => subComponentUpdate = subComponentTemplate(elem, slots);
			}
		});

		component.setProps({ id: 'foo', c1: false, c2: false });

		const update = parentTemplate(component);

		// Initial render
		assert.equal(component.innerHTML, read('./fixtures/slot1.html'));
		assert(subComponent);

		component.setProps({ c1: true, c2: true });
		update();
		assert.equal(component.innerHTML, read('./fixtures/slot2.html'));

		// Dispose incoming "header" slot: should render default value
		component.setProps({ c2: false });
		update();
		assert.equal(component.innerHTML, read('./fixtures/slot3.html'));

		// Set back incoming "header" slot
		component.setProps({ c2: true });
		update();
		assert.equal(component.innerHTML, read('./fixtures/slot2.html'));

		// Fill slot contents with iterator
		component.setProps({ items: [1, 2] });
		update();
		assert.equal(component.innerHTML, read('./fixtures/slot4.html'));

		// Enable "footer" slot in sub-component
		subComponent.setProps({ showFooter: true });
		subComponentUpdate();
		assert.equal(component.innerHTML, read('./fixtures/slot5.html'));

		// Disable "footer" slot
		subComponent.setProps({ showFooter: false });
		subComponentUpdate();
		assert.equal(component.innerHTML, read('./fixtures/slot4.html'));

		// ...and enable "footer" slot back again
		subComponent.setProps({ showFooter: true });
		subComponentUpdate();
		assert.equal(component.innerHTML, read('./fixtures/slot5.html'));

		// Re-render the same template: keep data as-is
		update();
		assert.equal(component.innerHTML, read('./fixtures/slot5.html'));

		// Dispose data rendered in iterator
		component.setProps({ items: null });
		update();
		assert.equal(component.innerHTML, read('./fixtures/slot6.html'));

	});
});