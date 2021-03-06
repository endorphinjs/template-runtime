import assert from 'assert';
import document from './assets/document';
import sample1 from './samples/slots/outer-component1';
import sample2 from './samples/slots/outer-component2';
import sample3 from './samples/slots/outer-component3';
import { createComponent, mountComponent } from '../runtime';

describe('Slot Update Hook', () => {
	const slotCallbacks = [];
	const last = arr => arr[arr.length - 1];

	before(() => {
		global.document = document;
		global.slotCallbacks = slotCallbacks;
	});
	after(() => {
		delete global.document;
		delete global.slotCallbacks;
	});
	afterEach(() => slotCallbacks.length = 0);

	it('sample 1', () => {
		const component = createComponent('my-component', {
			default: sample1,
			props() {
				return { header: 'Header 1', content: 'Content 1', footer: 'Footer 1' };
			}
		});

		// Initial render
		mountComponent(component);
		assert.equal(slotCallbacks.length, 1);
		assert.equal(last(slotCallbacks)[0], '');
		assert.equal(last(slotCallbacks)[1], 'Content 1');

		component.setProps({ content: 'Content 2' });
		assert.equal(slotCallbacks.length, 2);
		assert.equal(last(slotCallbacks)[0], '');
		assert.equal(last(slotCallbacks)[1], 'Content 2');

		component.setProps({ footer: 'Footer 2' });
		assert.equal(slotCallbacks.length, 2);
	});

	it('sample 2', () => {
		const component = createComponent('my-component', {
			default: sample2,
			props() {
				return {
					header: 'Header 1',
					content: 'Content 1',
					content2: 'SubContent 1',
					enabled: false
				};
			}
		});

		// Initial render
		mountComponent(component);
		assert.equal(slotCallbacks.length, 1);
		assert.equal(last(slotCallbacks)[0], '');
		assert.equal(last(slotCallbacks)[1], 'Content 1');

		component.setProps({ content2: 'SubContent 2' });
		assert.equal(slotCallbacks.length, 1);

		component.setProps({ enabled: true });
		assert.equal(slotCallbacks.length, 2);
		assert.equal(last(slotCallbacks)[0], '');
		assert.equal(last(slotCallbacks)[1], 'Content 1SubContent 2');

		component.setProps({ enabled: false });
		assert.equal(slotCallbacks.length, 3);
		assert.equal(last(slotCallbacks)[0], '');
		assert.equal(last(slotCallbacks)[1], 'Content 1');
	});

	it('sample 3', () => {
		const component = createComponent('my-component', {
			default: sample3,
			props() {
				return {
					header: 'Header 1',
					content: 'Content 1',
					content2: 'SubContent 1',
					footer: 'Footer 1',
					enabled: false,
					active: false
				};
			}
		});

		mountComponent(component);
		assert.equal(slotCallbacks.length, 2);
		assert.deepEqual(slotCallbacks[0], ['', 'Content 1']);
		assert.deepEqual(slotCallbacks[1], ['footer', 'Footer 1']);

		component.setProps({ active: true });
		assert.equal(slotCallbacks.length, 3);
		assert.deepEqual(last(slotCallbacks), ['footer', 'Footer 1\n\t\t\tBranching footer']);

		component.setProps({ active: false, footer: 'Footer 2' });
		assert.equal(slotCallbacks.length, 4);
		assert.deepEqual(last(slotCallbacks), ['footer', 'Footer 2']);

		component.setProps({ enabled: true, footer: 'Footer 3' });
		assert.equal(slotCallbacks.length, 6);
		assert.deepEqual(slotCallbacks[4], ['footer', 'Footer 3']);
		assert.deepEqual(slotCallbacks[5], ['', 'Content 1\n\t\t\tSubContent 1']);
	});
});
