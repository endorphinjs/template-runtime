import assert from 'assert';
import document from './assets/document';
import { createInjector, run, insert, block, dispose, move } from '../lib/injector';

describe('Injector', () => {
	before(() => global.document = document);
	after(() => delete global.document);

	const elem = name => document.createElement(name);
	const children = node => node.childNodes.map(elem => elem.nodeName);
	const render = (injector, fn) => {
		const b = block(injector);
		fn && run(injector, b, fn);
		return b;
	};

	it('flat blocks', () => {
		const parent = elem('div');
		const injector = createInjector(parent);
		const content1 = () => {
			insert(injector, elem('3'));
			insert(injector, elem('4'));
			insert(injector, elem('5'));
		};

		const content2 = () => {
			insert(injector, elem('6'));
			insert(injector, elem('7'));
		};

		const content3 = () => {
			insert(injector, elem('8'));
		};

		insert(injector, elem('1'));
		insert(injector, elem('2'));

		const block1 = render(injector, content1);
		const block2 = render(injector);
		const block3 = render(injector, content3);

		insert(injector, elem('9'));

		assert.deepEqual(children(parent), ['1', '2', '3', '4', '5', '8', '9']);
		assert.equal(block1.size, 3);
		assert.equal(block2.size, 0);
		assert.equal(block3.size, 1);

		// Dispose rendered block
		dispose(injector, block1);

		assert.deepEqual(children(parent), ['1', '2', '8', '9']);
		assert.equal(block1.size, 0);
		assert.equal(block2.size, 0);
		assert.equal(block3.size, 1);

		dispose(injector, block3);
		assert.deepEqual(children(parent), ['1', '2', '9']);
		assert.equal(block1.size, 0);
		assert.equal(block2.size, 0);
		assert.equal(block3.size, 0);

		// Render previously empty blocks
		run(injector, block2, content2);
		assert.deepEqual(children(parent), ['1', '2', '6', '7', '9']);
		assert.equal(block1.size, 0);
		assert.equal(block2.size, 2);
		assert.equal(block3.size, 0);

		run(injector, block3, content3);
		assert.deepEqual(children(parent), ['1', '2', '6', '7', '8', '9']);
		assert.equal(block1.size, 0);
		assert.equal(block2.size, 2);
		assert.equal(block3.size, 1);
	});

	it('nested blocks', () => {
		const parent = elem('div');
		const injector = createInjector(parent);
		const content1 = () => {
			insert(injector, elem('1'));
		};

		const content2 = () => {
			insert(injector, elem('2'));
			insert(injector, elem('3'));
		};

		const content3 = () => {
			insert(injector, elem('4'));
		};

		let block1, block2, block3;

		block1 = render(injector, () => {
			content1();
			block2 = render(injector, () => {
				content2();
				block3 = render(injector, content3);
			});
		});

		assert.deepEqual(children(parent), ['1', '2', '3', '4']);
		assert.equal(block1.size, 6);
		assert.equal(block2.size, 4);
		assert.equal(block3.size, 1);

		// Dispose deepest block
		run(injector, block1, () => {
			run(injector, block2, () => {
				dispose(injector, block3);
			});
		});

		assert.deepEqual(children(parent), ['1', '2', '3']);
		assert.equal(block1.size, 5);
		assert.equal(block2.size, 3);
		assert.equal(block3.size, 0);
		assert(injector.items.includes(block1));
		assert(injector.items.includes(block2));
		assert(injector.items.includes(block3));

		// Dispose outer block
		dispose(injector, block1);

		assert.deepEqual(children(parent), []);
		assert.equal(block1.size, 0);
		assert(injector.items.includes(block1));
		assert(!injector.items.includes(block2));
		assert(!injector.items.includes(block3));
	});

	it('dispose', () => {
		const parent = elem('div');
		const injector = createInjector(parent);
		const content1 = () => {
			insert(injector, elem('1'));
		};

		const content2 = () => {
			insert(injector, elem('2'));
			insert(injector, elem('3'));
		};

		const content3 = () => {
			insert(injector, elem('4'));
		};

		let block1, block2, block3;

		block1 = render(injector, () => {
			content1();
			block2 = render(injector, () => {
				content2();
				block3 = render(injector, content3);
			});
		});

		assert.deepEqual(children(parent), ['1', '2', '3', '4']);
		assert.equal(block1.size, 6);
		assert.equal(block2.size, 4);
		assert.equal(block3.size, 1);

		// Dispose deepest block
		run(injector, block1, () => {
			run(injector, block2, () => {
				dispose(injector, block3);
			});
		});

		assert.deepEqual(children(parent), ['1', '2', '3']);
		assert.equal(block1.size, 5);
		assert.equal(block2.size, 3);
		assert.equal(block3.size, 0);
		assert(injector.items.includes(block1));
		assert(injector.items.includes(block2));
		assert(injector.items.includes(block3));

		// Completely remove second block
		run(injector, block1, () => {
			dispose(injector, block2, null, true);
		});

		assert.deepEqual(children(parent), ['1']);
		assert.equal(block1.size, 1);
		assert.equal(block2.size, 0);
		assert.equal(block3.size, 0);
		assert(injector.items.includes(block1));
		assert(!injector.items.includes(block2));
		assert(!injector.items.includes(block3));
	});

	it('move', () => {
		const parent = elem('div');
		const injector = createInjector(parent);
		const content1 = () => {
			insert(injector, elem('1'));
		};

		const content2 = () => {
			insert(injector, elem('2'));
			insert(injector, elem('3'));
		};

		const content3 = () => {
			insert(injector, elem('4'));
			insert(injector, elem('5'));
		};

		const content4 = () => {
			insert(injector, elem('6'));
			insert(injector, elem('7'));
			insert(injector, elem('8'));
		};

		const block1 = render(injector, content1);
		const block2 = render(injector, content2);
		render(injector, content3);
		const block4 = render(injector, content4);

		assert.deepEqual(children(parent), ['1', '2', '3', '4', '5', '6', '7', '8']);

		move(injector, block4, injector.items.indexOf(block1));
		assert.deepEqual(children(parent), ['6', '7', '8', '1', '2', '3', '4', '5']);

		move(injector, block2, injector.items.length);
		assert.deepEqual(children(parent), ['6', '7', '8', '1', '4', '5', '2', '3']);
	});
});
