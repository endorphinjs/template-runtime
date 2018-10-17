import assert from 'assert';
import document from './assets/document';
import template from './samples/inner-html';

describe('Inner HTML', () => {
	before(() => global.document = document);
	after(() => delete global.document);

	it('render and update inner HTML', () => {
		const component = document.createElement('div');
		component.scope = 'ih';
		component.setProps({ c1: false, c2: false, html: '<main>hello <b>world</b></main>' });

		const update = template(component);

		// Initial render
		assert.equal(component.innerHTML, '<main ih="">\n\thello \n\t<b ih="">world</b>\n</main>');
		const prevFirst = component.firstChild;

		// Re-render with same content, make sure content is not re-rendered
		update();
		assert.equal(component.innerHTML, '<main ih="">\n\thello \n\t<b ih="">world</b>\n</main>');
		assert.strictEqual(component.firstChild, prevFirst);

		component.setProps({ c1: true, c2: true, html: '<main>hello <b>world</b></main>' });
		update();
		assert.equal(component.innerHTML, '<div ih="">foo</div>\n<main ih="">\n\thello \n\t<b ih="">world</b>\n</main>\n<p ih="">bar</p>');
		assert.strictEqual(component.childNodes[1], prevFirst);

		// Update inner HTML
		component.setProps({ c1: true, c2: true, html: '<main>hello1 <span>world2</span></main>' });
		update();
		assert.equal(component.innerHTML, '<div ih="">foo</div>\n<main ih="">\n\thello1 \n\t<span ih="">world2</span>\n</main>\n<p ih="">bar</p>');
	});
});
