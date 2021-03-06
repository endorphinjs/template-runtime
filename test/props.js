import assert from 'assert';
import document from './assets/document';
import template from './samples/props';
import { createComponent, mountComponent, renderComponent, updateComponent, setAttribute} from '../runtime';

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

		renderComponent(component);
		assert.deepEqual(sub.props, { p1: 1, id: 'bar', p3: 3, p2: 2 });

		component.setProps({ c1: false });
		assert.deepEqual(sub.props, { p1: 1, id: 'bar', p3: 3, p2: null });
	});

	it('should init with default props', () => {
		const component = createComponent('my-component', {
			default: template,
			props() {
				return { id: 'foo', c1: false };
			}
		});

		setAttribute(component.componentModel.input, 'c1', true);
		mountComponent(component, { id: 'bar' });
		assert.deepEqual(component.props, { id: 'bar', c1: true });

		setAttribute(component.componentModel.input, 'c1', false);
		updateComponent(component);
		assert.deepEqual(component.props, { id: 'bar', c1: false });
	});
});
