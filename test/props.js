import assert from 'assert';
import document from './assets/document';
import template from './samples/props';
import { createComponent, mountComponent } from '../runtime';

describe('Props', () => {
	before(() => global.document = document);
	after(() => delete global.document);

	it('should update props', () => {
		const component = createComponent('my-component', {
			default: template,
			props() {
				return { id: 'foo', c1: false };
			}
		});

		// Initial render
		mountComponent(component);
		const sub = component.firstChild;
		assert.deepEqual(sub.props, { p1: 1, id: 'foo', p3: 3 });

		component.setProps({ id: 'bar', c1: true });
		assert.deepEqual(sub.props, { p1: 1, id: 'bar', p3: 3, p2: 2 });

		component.component.update();
		assert.deepEqual(sub.props, { p1: 1, id: 'bar', p3: 3, p2: 2 });

		component.setProps({ c1: false });
		assert.deepEqual(sub.props, { p1: 1, id: 'bar', p3: 3, p2: null });
	});
});
