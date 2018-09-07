import assert from 'assert';
import { createInjector } from '../runtime';
import ElementShim from './assets/element-shim';

describe('Injector', () => {
	const run = (injector, block, fn) => {
		injector.enter(block);
		if (typeof fn === 'function') {
			fn();
		}
		return injector.exit();
	};
	const render = (injector, fn) => run(injector, injector.block(), fn);

	it('flat blocks', () => {
		const parent = new ElementShim();
		const injector = createInjector(parent);
		const content1 = () => {
			injector.insert(3);
			injector.insert(4);
			injector.insert(5);
		};

		const content2 = () => {
			injector.insert(6);
			injector.insert(7);
		};

		const content3 = () => {
			injector.insert(8);
		};

		injector.insert(1);
		injector.insert(2);

		const block1 = render(injector, content1);
		const block2 = render(injector);
		const block3 = render(injector, content3);

		injector.insert(9);

		assert.deepEqual(parent.childNodes, [1, 2, 3, 4, 5, 8, 9]);
		assert.equal(block1.size, 3);
		assert.equal(block2.size, 0);
		assert.equal(block3.size, 1);

		// Dispose rendered block
		run(injector, block1, () => injector.dispose());

		assert.deepEqual(parent.childNodes, [1, 2, 8, 9]);
		assert.equal(block1.size, 0);
		assert.equal(block2.size, 0);
		assert.equal(block3.size, 1);

		run(injector, block3, () => injector.dispose());
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
			injector.insert(1);
		};

		const content2 = () => {
			injector.insert(2);
			injector.insert(3);
		};

		const content3 = () => {
			injector.insert(4);
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
				run(injector, block3, () => injector.dispose());
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
		run(injector, block1, () => injector.dispose());

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
			injector.insert(1);
		};

		const content2 = () => {
			injector.insert(2);
			injector.insert(3);
		};

		const content3 = () => {
			injector.insert(4);
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
				run(injector, block3, () => injector.dispose());
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
			run(injector, block2, () => {
				injector.dispose(true);
			});
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
			injector.insert(1);
		};

		const content2 = () => {
			injector.insert(2);
			injector.insert(3);
		};

		const content3 = () => {
			injector.insert(4);
			injector.insert(5);
		};

		const content4 = () => {
			injector.insert(6);
			injector.insert(7);
			injector.insert(8);
		};

		const block1 = render(injector, content1);
		const block2 = render(injector, content2);
		render(injector, content3);
		const block4 = render(injector, content4);

		assert.deepEqual(parent.childNodes, [1, 2, 3, 4, 5, 6, 7, 8]);

		injector.move(block4, injector.items.indexOf(block1));
		assert.deepEqual(parent.childNodes, [6, 7, 8, 1, 2, 3, 4, 5]);

		injector.move(block2, injector.items.length);
		assert.deepEqual(parent.childNodes, [6, 7, 8, 1, 4, 5, 2, 3]);
	});
});
