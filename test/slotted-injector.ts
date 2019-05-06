import assert from 'assert';
import document from './assets/document';
import { createInjector, run, insert, injectBlock, emptyBlockContent, disposeBlock } from '../src/injector';
import { obj } from '../src/utils';
import { Injector, FunctionBlock, MountBlock, LinkedList } from '../types';

describe('Slotted injector', () => {
	before(() => global['document'] = document);
	after(() => delete global['document']);

	const elem = (name: string) => document.createElement(name) as any as HTMLElement;
	const children = (node: Element | DocumentFragment) => Array.from(node.childNodes).map(el => el.nodeName);

	function render(injector: Injector, fn?: MountBlock): FunctionBlock {
		const b = injectBlock(injector, { $$block: true, injector, fn } as FunctionBlock);
		fn && run(b, fn, b);
		injector.ptr = b.end;
		return b;
	}

	function listHas<T>(list: LinkedList<T>, value: T): boolean {
		let item = list.head;
		while (item) {
			if (item.value === value) {
				return true;
			}

			item = item.next;
		}
	}

	it('flat blocks', () => {
		const parent = elem('div');
		const injector = createInjector(parent as Element);
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

		// Empty rendered block
		emptyBlockContent(block1);

		assert.deepEqual(children(parent), []);
		assert.deepEqual(children(injector.slots['']), ['1', '2', '8', '9']);
		assert.deepEqual(children(injector.slots['slot1']), []);

		emptyBlockContent(block3);
		assert.deepEqual(children(parent), []);
		assert.deepEqual(children(injector.slots['']), ['1', '2', '9']);
		assert.deepEqual(children(injector.slots['slot1']), []);

		// Render previously empty blocks
		run(block2, content2);
		assert.deepEqual(children(parent), []);
		assert.deepEqual(children(injector.slots['']), ['1', '2', '9']);
		assert.deepEqual(children(injector.slots['slot1']), ['6']);
		assert.deepEqual(children(injector.slots['slot2']), ['7']);

		run(block1, content1);
		assert.deepEqual(children(parent), []);
		assert.deepEqual(children(injector.slots['']), ['1', '2', '3', '5', '9']);
		assert.deepEqual(children(injector.slots['slot1']), ['4', '6']);
		assert.deepEqual(children(injector.slots['slot2']), ['7']);
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

		let block1: FunctionBlock;
		let block2: FunctionBlock;
		let block3: FunctionBlock;

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

		// Empty deepest block
		emptyBlockContent(block3);

		assert.deepEqual(children(parent), []);
		assert.deepEqual(children(injector.slots['']), ['1', '2']);
		assert.deepEqual(children(injector.slots['slot1']), ['3']);

		assert(listHas(injector.items, block1));
		assert(listHas(injector.items, block2));
		assert(listHas(injector.items, block3));

		// Empty outer block
		emptyBlockContent(block1);

		assert.deepEqual(children(parent), []);
		assert.deepEqual(children(injector.slots['']), []);
		assert.deepEqual(children(injector.slots['slot1']), []);
		assert(listHas(injector.items, block1));
		assert(!listHas(injector.items, block2));
		assert(!listHas(injector.items, block3));
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

		let block1: FunctionBlock;
		let block2: FunctionBlock;
		let block3: FunctionBlock;

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

		// Completely remove second block
		disposeBlock(block2);

		assert.deepEqual(children(parent), []);
		assert.deepEqual(children(injector.slots['']), ['1']);
		assert.deepEqual(children(injector.slots['slot1']), []);
		assert(listHas(injector.items, block1));
		assert(!listHas(injector.items, block2));
		assert(!listHas(injector.items, block3));
	});
});
