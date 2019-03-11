import assert from 'assert';
import document from './assets/document';
import { createInjector, run, insert, block, dispose, move } from '../lib/injector';
import { obj } from '../lib/utils';

describe('Slotted injector', () => {
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
		injector.slots = obj();

		const content1 = () => {
			insert(injector, elem('3'));
			insert(injector, elem('4'), 'slot1');
			insert(injector, elem('5'));
		};

		const content2 = () => {
			insert(injector, elem('6'), 'slot1');
			insert(injector, elem('7'), 'slot2');
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

		// In slotted injector, parent node should be empty, all nodes should
		// be spreaded across slots
		assert.deepEqual(children(parent), []);
		assert.deepEqual(children(injector.slots['']), ['1', '2', '3', '5', '8', '9']);
		assert.deepEqual(children(injector.slots['slot1']), ['4']);

		assert.equal(block1.size, 3);
		assert.equal(block2.size, 0);
		assert.equal(block3.size, 1);

		// Dispose rendered block
		dispose(injector, block1);

		assert.deepEqual(children(parent), []);
		assert.deepEqual(children(injector.slots['']), ['1', '2', '8', '9']);
		assert.deepEqual(children(injector.slots['slot1']), []);
		assert.equal(block1.size, 0);
		assert.equal(block2.size, 0);
		assert.equal(block3.size, 1);

		dispose(injector, block3);
		assert.deepEqual(children(parent), []);
		assert.deepEqual(children(injector.slots['']), ['1', '2', '9']);
		assert.deepEqual(children(injector.slots['slot1']), []);
		assert.equal(block1.size, 0);
		assert.equal(block2.size, 0);
		assert.equal(block3.size, 0);

		// Render previously empty blocks
		run(injector, block2, content2);
		assert.deepEqual(children(parent), []);
		assert.deepEqual(children(injector.slots['']), ['1', '2', '9']);
		assert.deepEqual(children(injector.slots['slot1']), ['6']);
		assert.deepEqual(children(injector.slots['slot2']), ['7']);
		assert.equal(block1.size, 0);
		assert.equal(block2.size, 2);
		assert.equal(block3.size, 0);

		run(injector, block1, content1);
		assert.deepEqual(children(parent), []);
		assert.deepEqual(children(injector.slots['']), ['1', '2', '3', '5', '9']);
		assert.deepEqual(children(injector.slots['slot1']), ['4', '6']);
		assert.deepEqual(children(injector.slots['slot2']), ['7']);
		assert.equal(block1.size, 3);
		assert.equal(block2.size, 2);
		assert.equal(block3.size, 0);
	});

	it('nested blocks', () => {
		const parent = elem('div');
		const injector = createInjector(parent);
		injector.slots = obj();

		const content1 = () => {
			insert(injector, elem('1'));
		};

		const content2 = () => {
			insert(injector, elem('2'));
			insert(injector, elem('3'), 'slot1');
		};

		const content3 = () => {
			insert(injector, elem('4'), 'slot1');
		};

		let block1, block2, block3;

		block1 = render(injector, () => {
			content1();
			block2 = render(injector, () => {
				content2();
				block3 = render(injector, content3);
			});
		});

		assert.deepEqual(children(parent), []);
		assert.deepEqual(children(injector.slots['']), ['1', '2']);
		assert.deepEqual(children(injector.slots['slot1']), ['3', '4']);
		assert.equal(block1.size, 6);
		assert.equal(block2.size, 4);
		assert.equal(block3.size, 1);

		// Dispose deepest block
		run(injector, block1, () => {
			run(injector, block2, () => {
				dispose(injector, block3);
			});
		});

		assert.deepEqual(children(parent), []);
		assert.deepEqual(children(injector.slots['']), ['1', '2']);
		assert.deepEqual(children(injector.slots['slot1']), ['3']);
		assert.equal(block1.size, 5);
		assert.equal(block2.size, 3);
		assert.equal(block3.size, 0);
		assert(injector.items.includes(block1));
		assert(injector.items.includes(block2));
		assert(injector.items.includes(block3));

		// Dispose outer block
		dispose(injector, block1);

		assert.deepEqual(children(parent), []);
		assert.deepEqual(children(injector.slots['']), []);
		assert.deepEqual(children(injector.slots['slot1']), []);
		assert.equal(block1.size, 0);
		assert(injector.items.includes(block1));
		assert(!injector.items.includes(block2));
		assert(!injector.items.includes(block3));
	});

	it('dispose', () => {
		const parent = elem('div');
		const injector = createInjector(parent);
		injector.slots = obj();

		const content1 = () => {
			insert(injector, elem('1'));
		};

		const content2 = () => {
			insert(injector, elem('2'), 'slot1');
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

		assert.deepEqual(children(parent), []);
		assert.deepEqual(children(injector.slots['']), ['1', '3', '4']);
		assert.deepEqual(children(injector.slots['slot1']), ['2']);
		assert.equal(block1.size, 6);
		assert.equal(block2.size, 4);
		assert.equal(block3.size, 1);

		// Completely remove second block
		run(injector, block1, () => {
			dispose(injector, block2, null, true);
		});

		assert.deepEqual(children(parent), []);
		assert.deepEqual(children(injector.slots['']), ['1']);
		assert.deepEqual(children(injector.slots['slot1']), []);
		assert.equal(block1.size, 1);
		assert.equal(block2.size, 0);
		assert(injector.items.includes(block1));
		assert(!injector.items.includes(block2));
		assert(!injector.items.includes(block3));
	});

	it('move', () => {
		const parent = elem('div');
		const injector = createInjector(parent);
		injector.slots = obj();

		const content1 = () => {
			insert(injector, elem('1'));
		};

		const content2 = () => {
			insert(injector, elem('2'), 'slot1');
			insert(injector, elem('3'));
		};

		const content3 = () => {
			insert(injector, elem('4'), 'slot1');
			insert(injector, elem('5'));
		};

		const content4 = () => {
			insert(injector, elem('6'));
			insert(injector, elem('7'), 'slot2');
			insert(injector, elem('8'), 'slot1');
		};

		const block1 = render(injector, content1);
		const block2 = render(injector, content2);
		render(injector, content3);
		const block4 = render(injector, content4);

		assert.deepEqual(children(parent), []);
		assert.deepEqual(children(injector.slots['']), ['1', '3', '5', '6']);
		assert.deepEqual(children(injector.slots['slot1']), ['2', '4', '8']);
		assert.deepEqual(children(injector.slots['slot2']), ['7']);

		move(injector, block4, injector.items.indexOf(block1));
		assert.deepEqual(children(parent), []);
		assert.deepEqual(children(injector.slots['']), ['6', '1', '3', '5']);
		assert.deepEqual(children(injector.slots['slot1']), ['8', '2', '4']);
		assert.deepEqual(children(injector.slots['slot2']), ['7']);

		move(injector, block2, injector.items.length);
		assert.deepEqual(children(parent), []);
		assert.deepEqual(children(injector.slots['']), ['6', '1', '5', '3']);
		assert.deepEqual(children(injector.slots['slot1']), ['8', '4', '2']);
		assert.deepEqual(children(injector.slots['slot2']), ['7']);
	});
});
