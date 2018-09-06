import assert from 'assert';
import document from './assets/document';

describe('Shim', () => {
	it('document', () => {
		const div = document.createElement('div');
		div.setAttribute('title', 'test');
		const strong = div.appendChild(document.createElement('strong'));
		strong.appendChild(document.createTextNode('hello world'));
		const text = document.createTextNode('text');
		div.insertBefore(text, strong);
		const comment = div.appendChild(document.createComment('sample comment'));

		assert.strictEqual(div.childNodes.length, 3);
		assert.strictEqual(div.attributes.length, 1);
		assert.strictEqual(div.getAttribute('title'), 'test');

		assert.strictEqual(div.childNodes[0], text);
		assert.strictEqual(div.childNodes[1], strong);
		assert.strictEqual(div.childNodes[2], comment);

		assert.strictEqual(div.toString(), `<div title="test">
	text
	<strong>hello world</strong>
	<!--sample comment-->
</div>`);
	});

	it('document fragment', () => {
		const df = document.createDocumentFragment();
		const div = df.appendChild(document.createElement('div'));
		const span = df.appendChild(document.createElement('span'));
		df.appendChild(document.createTextNode('text'));
		assert.strictEqual(df.childNodes.length, 3);

		const container = document.createElement('div');
		container.appendChild(df);
		assert.strictEqual(df.childNodes.length, 0);
		assert.strictEqual(container.childNodes.length, 3);
		assert.strictEqual(container.firstChild, div);
		assert.strictEqual(div.nextSibling, span);
		assert.strictEqual(span.previousSibling, div);

		df.appendChild(document.createTextNode('1'));
		df.appendChild(document.createTextNode('2'));
		df.appendChild(document.createTextNode('3'));

		container.insertBefore(df, span);
		assert.strictEqual(df.childNodes.length, 0);
		assert.strictEqual(container.childNodes.length, 6);
		assert.strictEqual(container.childNodes[1].nodeValue, '1');
		assert.strictEqual(container.childNodes[2].nodeValue, '2');
		assert.strictEqual(container.childNodes[3].nodeValue, '3');
	});
});
