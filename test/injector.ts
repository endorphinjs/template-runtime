import * as assert from 'assert';
import document, { ElementShim } from './assets/document';
import { createInjector, run, insert, move, emptyBlockContent, injectBlock, disposeBlock } from '../src/injector';
import { Injector, RunCallback, FunctionBlock, LinkedList, LinkedListItem } from '../types';

describe('Injector', () => {
	before(() => global['document'] = document);
	after(() => delete global['document']);

	const elem = (name: string) => document.createElement(name) as any as Element;
	const children = (node: Element) => (node as any as ElementShim).childNodes.map((el: ElementShim) => el.nodeName);

	function render(injector: Injector, fn?: RunCallback<any, void>) {
		const b = injectBlock(injector, { $$block: true, injector, fn } as FunctionBlock);
		fn && run(b, fn, b);
		injector.ptr = b.end;
		return b;
	}

	function listHas<T>(list: LinkedList<T>, value: T) {
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

		// Empty rendered block
		emptyBlockContent(block1);
		assert.deepEqual(children(parent), ['1', '2', '8', '9']);

		emptyBlockContent(block3);
		assert.deepEqual(children(parent), ['1', '2', '9']);

		// Render previously empty blocks
		run(block2, content2);
		assert.deepEqual(children(parent), ['1', '2', '6', '7', '9']);

		run(block3, content3);
		assert.deepEqual(children(parent), ['1', '2', '6', '7', '8', '9']);
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

		assert.deepEqual(children(parent), ['1', '2', '3', '4']);

		// Empty deepest block
		emptyBlockContent(block3);

		assert.deepEqual(children(parent), ['1', '2', '3']);
		assert(listHas(injector.items, block1));
		assert(listHas(injector.items, block2));
		assert(listHas(injector.items, block3));

		// Empty outer block
		emptyBlockContent(block1);

		assert.deepEqual(children(parent), []);
		assert(listHas(injector.items, block1));
		assert(!listHas(injector.items, block2));
		assert(!listHas(injector.items, block3));
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

		assert.deepEqual(children(parent), ['1', '2', '3', '4']);

		// Empty deepest block
		emptyBlockContent(block3);

		assert.deepEqual(children(parent), ['1', '2', '3']);
		assert(listHas(injector.items, block1));
		assert(listHas(injector.items, block2));
		assert(listHas(injector.items, block3));

		// Completely remove second block
		disposeBlock(block2);

		assert.deepEqual(children(parent), ['1']);
		assert(listHas(injector.items, block1));
		assert(!listHas(injector.items, block2));
		assert(!listHas(injector.items, block3));
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

		render(injector, content1);
		const block2 = render(injector, content2);
		const block3 = render(injector, content3);
		const block4 = render(injector, content4);

		assert.deepEqual(children(parent), ['1', '2', '3', '4', '5', '6', '7', '8']);

		// move as first item
		move(injector, block4);
		assert.deepEqual(children(parent), ['6', '7', '8', '1', '2', '3', '4', '5']);

		// TODO something’s not right here
		move(injector, block2, block3 as any as LinkedListItem<any>);
		assert.deepEqual(children(parent), ['6', '7', '8', '1', '4', '5', '2', '3']);
	});
});
