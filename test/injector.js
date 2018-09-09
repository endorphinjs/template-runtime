import assert from 'assert';
import ElementShim from './assets/element-shim';
import { createInjector, run, insert, block, dispose, move } from '../lib/injector';

describe('Injector', () => {
	const render = (injector, fn) => {
		const b = block(injector);
		run(injector, b, fn);
		return b;
	};

	it('flat blocks', () => {
		const parent = new ElementShim();
		const injector = createInjector(parent);
		const content1 = () => {
			insert(injector, 3);
			insert(injector, 4);
			insert(injector, 5);
		};

		const content2 = () => {
			insert(injector, 6);
			insert(injector, 7);
		};

		const content3 = () => {
			insert(injector, 8);
		};

		insert(injector, 1);
		insert(injector, 2);

		const block1 = render(injector, content1);
		const block2 = render(injector);
		const block3 = render(injector, content3);

		insert(injector, 9);

		assert.deepEqual(parent.childNodes, [1, 2, 3, 4, 5, 8, 9]);
		assert.equal(block1.size, 3);
		assert.equal(block2.size, 0);
		assert.equal(block3.size, 1);

		// Dispose rendered block
		dispose(injector, block1);

		assert.deepEqual(parent.childNodes, [1, 2, 8, 9]);
		assert.equal(block1.size, 0);
		assert.equal(block2.size, 0);
		assert.equal(block3.size, 1);

		dispose(injector, block3);
		assert.deepEqual(parent.childNodes, [1, 2, 9]);
		assert.equal(block1.size, 0);
		assert.equal(block2.size, 0);
		assert.equal(block3.size, 0);

		// Render previously empty blocks
		run(injector, block2, content2);
		assert.deepEqual(parent.childNodes, [1, 2, 6, 7, 9]);
		assert.equal(block1.size, 0);
		assert.equal(block2.size, 2);
		assert.equal(block3.size, 0);

		run(injector, block3, content3);
		assert.deepEqual(parent.childNodes, [1, 2, 6, 7, 8, 9]);
		assert.equal(block1.size, 0);
		assert.equal(block2.size, 2);
		assert.equal(block3.size, 1);
	});

	it('nested blocks', () => {
		const parent = new ElementShim();
		const injector = createInjector(parent);
		const content1 = () => {
			insert(injector, 1);
		};

		const content2 = () => {
			insert(injector, 2);
			insert(injector, 3);
		};

		const content3 = () => {
			insert(injector, 4);
		};

		let block1, block2, block3;

		block1 = render(injector, () => {
			content1();
			block2 = render(injector, () => {
				content2();
				block3 = render(injector, content3);
			});
		});

		assert.deepEqual(parent.childNodes, [1, 2, 3, 4]);
		assert.equal(block1.size, 6);
		assert.equal(block2.size, 4);
		assert.equal(block3.size, 1);

		// Dispose deepest block
		run(injector, block1, () => {
			run(injector, block2, () => {
				dispose(injector, block3);
			});
		});

		assert.deepEqual(parent.childNodes, [1, 2, 3]);
		assert.equal(block1.size, 5);
		assert.equal(block2.size, 3);
		assert.equal(block3.size, 0);
		assert(injector.items.includes(block1));
		assert(injector.items.includes(block2));
		assert(injector.items.includes(block3));

		// Dispose outer block
		dispose(injector, block1);

		assert.deepEqual(parent.childNodes, []);
		assert.equal(block1.size, 0);
		assert.equal(block2.size, 3);
		assert.equal(block3.size, 0);
		assert(injector.items.includes(block1));
		assert(!injector.items.includes(block2));
		assert(!injector.items.includes(block3));
	});

	it('dispose', () => {
		const parent = new ElementShim();
		const injector = createInjector(parent);
		const content1 = () => {
			insert(injector, 1);
		};

		const content2 = () => {
			insert(injector, 2);
			insert(injector, 3);
		};

		const content3 = () => {
			insert(injector, 4);
		};

		let block1, block2, block3;

		block1 = render(injector, () => {
			content1();
			block2 = render(injector, () => {
				content2();
				block3 = render(injector, content3);
			});
		});

		assert.deepEqual(parent.childNodes, [1, 2, 3, 4]);
		assert.equal(block1.size, 6);
		assert.equal(block2.size, 4);
		assert.equal(block3.size, 1);

		// Dispose deepest block
		run(injector, block1, () => {
			run(injector, block2, () => {
				dispose(injector, block3);
			});
		});

		assert.deepEqual(parent.childNodes, [1, 2, 3]);
		assert.equal(block1.size, 5);
		assert.equal(block2.size, 3);
		assert.equal(block3.size, 0);
		assert(injector.items.includes(block1));
		assert(injector.items.includes(block2));
		assert(injector.items.includes(block3));

		// Completely remove second block
		run(injector, block1, () => {
			dispose(injector, block2, true);
		});

		assert.deepEqual(parent.childNodes, [1]);
		assert.equal(block1.size, 1);
		assert.equal(block2.size, 0);
		assert.equal(block3.size, 0);
		assert(injector.items.includes(block1));
		assert(!injector.items.includes(block2));
		assert(!injector.items.includes(block3));
	});

	it('move', () => {
		const parent = new ElementShim();
		const injector = createInjector(parent);
		const content1 = () => {
			insert(injector, 1);
		};

		const content2 = () => {
			insert(injector, 2);
			insert(injector, 3);
		};

		const content3 = () => {
			insert(injector, 4);
			insert(injector, 5);
		};

		const content4 = () => {
			insert(injector, 6);
			insert(injector, 7);
			insert(injector, 8);
		};

		const block1 = render(injector, content1);
		const block2 = render(injector, content2);
		render(injector, content3);
		const block4 = render(injector, content4);

		assert.deepEqual(parent.childNodes, [1, 2, 3, 4, 5, 6, 7, 8]);

		move(injector, block4, injector.items.indexOf(block1));
		assert.deepEqual(parent.childNodes, [6, 7, 8, 1, 2, 3, 4, 5]);

		move(injector, block2, injector.items.length);
		assert.deepEqual(parent.childNodes, [6, 7, 8, 1, 4, 5, 2, 3]);
	});
});
