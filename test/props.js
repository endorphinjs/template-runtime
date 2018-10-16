import assert from 'assert';
import document from './assets/document';
import template from './samples/props';

describe('Props', () => {
	before(() => global.document = document);
	after(() => delete global.document);

	it('should update props', () => {
		const component = document.createElement('div');

		component.setProps({ id: 'foo', c1: false });

		// Initial render
		const update = template(component);
		const sub = component.firstChild;

		assert.deepEqual(sub.props, { p1: 1, id: 'foo', p3: 3 });

		component.setProps({ id: 'bar', c1: true });
		update();
		assert.deepEqual(sub.props, { p1: 1, id: 'bar', p3: 3, p2: 2 });

		update();
		assert.deepEqual(sub.props, { p1: 1, id: 'bar', p3: 3, p2: 2 });

		component.setProps({ c1: false });
		update();
		assert.deepEqual(sub.props, { p1: 1, id: 'bar', p3: 3, p2: null });
	});
});
