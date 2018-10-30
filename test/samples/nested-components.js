import {
	createInjector, mountBlock, updateBlock, renderSlot, setAttribute, finalizeAttributes,
	elemWithText, elem, text, insert,
	createScope, getProp, mountIterator, updateIterator
} from '../../runtime';

export default function template(component, slots) {
	const scope = createScope(component, slots);
	const injector = createInjector(component);

	insert(injector, elemWithText('h1', 'Title'));
	const subComponent1 = insert(injector, elem('sub-component1'));
	const subInjector1 = createInjector(subComponent1, true);
	const subComponent2 = insert(subInjector1, elem('sub-component2'));
	const subInjector2 = createInjector(subComponent2, true);
	insert(subComponent2, text('Hello world'));

}
