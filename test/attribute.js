import assert from 'assert';
import document from './assets/document';
import attribute1 from './samples/attribute1';
import attribute2 from './samples/attribute2';

describe('Attribute', () => {
	before(() => global.document = document);
	after(() => delete global.document);

	it('should properly update attributes with the same name', () => {
		const component = document.createElement('div');
		component.setProps({ id: 'foo', c1: false, c2: false, c3: false });

		const update = attribute1(component);

		// Initial render
		assert.equal(component.innerHTML, '<main a1="foo" a2="0" a3="4"></main>');

		component.setProps({ id: 'foo2', c1: true, c2: false, c3: true });
		update();
		assert.equal(component.innerHTML, '<main a1="3" a2="3" a3="4"></main>');

		component.setProps({ c2: true, c3: false });
		update();
		assert.equal(component.innerHTML, '<main a1="foo2" a2="2" a3="4"></main>');

		// Re-render: should keep previous result
		update();
		assert.equal(component.innerHTML, '<main a1="foo2" a2="2" a3="4"></main>');

		component.setProps({ c1: false, c2: false });
		update();
		assert.equal(component.innerHTML, '<main a1="foo2" a2="0" a3="4"></main>');
	});

	it('should add class names', () => {
		const component = document.createElement('div');
		component.setProps({ id: 'foo', c1: false, c2: false, c3: false, classAddon: 'baz' });

		const update = attribute2(component);

		// Initial render
		assert.equal(component.innerHTML, '<main a1="foo" a2="0" class="foo baz"></main>');

		// Re-render: retain the same result
		update();
		assert.equal(component.innerHTML, '<main a1="foo" a2="0" class="foo baz"></main>');

		component.setProps({ c1: true, c2: true });
		update();
		assert.equal(component.innerHTML, '<main a1="foo" a2="1" class="foo bar baz"></main>');

		// Re-render: should retain previous result
		update();
		assert.equal(component.innerHTML, '<main a1="foo" a2="1" class="foo bar baz"></main>');

		component.setProps({ c3: true });
		update();
		assert.equal(component.innerHTML, '<main a1="foo" a2="1" class="bam foo baz"></main>');
	});
});
