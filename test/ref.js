import assert from 'assert';
import document from './assets/document';
import template from './samples/refs';
import { createComponent, mountComponent } from '../runtime';

describe('Refs', () => {
	before(() => global.document = document);
	after(() => delete global.document);

	it('should store and update refs', () => {
		const component = createComponent('my-component', {
			default: template,
			props() {
				return { c1: false, dynRef: 'foo' };
			}
		});

		// Initial render
		mountComponent(component);
		const refs = component.refs;
		assert.deepEqual(Object.keys(refs), ['main', 'header', 'foo']);

		assert.strictEqual(refs.main.nodeName, 'main');
		assert(refs.main.hasAttribute('ref-main'));

		assert.strictEqual(refs.header.nodeName, 'div');
		assert(refs.header.hasAttribute('ref-header'));

		assert.strictEqual(refs.foo.nodeName, 'footer');
		assert(refs.foo.hasAttribute('ref-foo'));

		const prevHeader = refs.header;
		const prevFoo = refs.foo;

		component.setProps({ c1: true, dynRef: 'bar' });
		assert.deepEqual(Object.keys(refs), ['main', 'header', 'foo', 'bar']);

		assert.strictEqual(refs.main.nodeName, 'main');
		assert(refs.main.hasAttribute('ref-main'));

		assert.strictEqual(refs.header.nodeName, 'span');
		assert(refs.header.hasAttribute('ref-header'));

		assert.strictEqual(refs.foo, null);

		assert.strictEqual(refs.bar.nodeName, 'footer');
		assert(refs.bar.hasAttribute('ref-bar'));

		// Make sure ref attributes are removed
		assert(!prevHeader.hasAttribute('ref-header'));
		assert(!prevFoo.hasAttribute('ref-foo'));

		component.setProps({ c1: false, dynRef: 'bar' });
		assert.deepEqual(Object.keys(refs), ['main', 'header', 'foo', 'bar']);
		assert.strictEqual(refs.header.nodeName, 'div');
		assert.strictEqual(refs.header, prevHeader);
		assert(refs.header.hasAttribute('ref-header'));
	});
});
