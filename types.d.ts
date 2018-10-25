declare interface ComponentModel extends HTMLElement {
	/**
	 * Pointer to component view container. By default, it’s the same as component
	 * element, but for native Web Components it can point to shadow root
	 */
	readonly componentView: HTMLElement;

	/**
	 * Component properties (external contract)
	 */
	props: object;

	/**
	 * Component state (internal props)
	 */
	state: object;

	/**
	 * References to rendered elements
	 */
	refs: RefMap;

	/**
	 * References to component slot containers. Default slot is available as `slot['']`
	 */
	slots: RefMap;

	/**
	 * List of components used by current component
	 */
	components: object;

	/**
	 * Updates props with data from `value`
	 * @param value Updated props
	 * @returns Final props
	 */
	setProps(value: object): object;

	/**
	 * Returns current props
	 */
	getProps(): object;

	/**
	 * Updates state with data from `value`
	 * @param value Updated values
	 * @returns Final state
	 */
	setState(value: object): object;

	/**
	 * Returns current state
	 */
	getState(): object;

	/**
	 * Renders current component
	 */
	render(): void;

	/**
	 * Subscribe to event listener. Alias for `addEventListener()`
	 * @param type Event type
	 * @param listener Event listener
	 * @param options Listener options
	 */
	on(type: string, listener: function, options: any): ComponentModel;

	/**
	 * Unsubscribe listener from given event. Alias for `removeEventListener()`
	 * @param type Event type
	 * @param listener Event listener
	 * @param options Listener options
	 */
	off(type: string, listener: function, options: any): ComponentModel;

	/**
	 * Dispatches event with given name. Alias for `dispatchEvent(new CustomEvent(...))`
	 * @param event Event name
	 * @param detail Additional event data
	 */
	emit(event: string | CustomEvent, detail?: any): ComponentModel;
}

declare interface ComponentDefinition {
	/**
	 * Initial props factory
	 */
	props(): object;

	/**
	 * Initial state factory
	 */
	state(): object;

	/**
	 * Listeners for events bubbling from component contents
	 */
	events(): object;

	/**
	 * Component created
	 */
	init(): void;

	/**
	 * Component is about to be destroyed
	 */
	destroy(): void;

	/**
	 * Component is about to be rendered. If `false` value is returned, component
	 * rendering will be cancelled
	 * @param updatedProps Updated props that caused component to re-render
	 * @param updatedState Updated state that caused component to re-render
	 */
	willRender(updatedProps?: ChangeSet, updatedState?: ChangeSet): boolean;

	/**
	 * Component just rendered
	 */
	didRender(): void;

	/**
	 * Element is about to be animated
	 * @param elem Element being animated
	 * @param type Animation type: `in` or `out`
	 * @param animation Animation CSS property
	 */
	willAnimate(elem: HTMLElement, type: string, animation: string);

	/**
	 * Element animation is finished
	 * @param elem Element being animated
	 * @param type Animation type: `in` or `out`
	 * @param animation Animation CSS property
	 */
	didAnimate(elem: HTMLElement, type: string, animation: string): void;

	/**
	 * List of components used by current component
	 */
	components: object;
}

interface RefMap {
	[key: string]: HTMLElement;
}

interface ChangeSet {
	prev: object;
	next: object;
}
