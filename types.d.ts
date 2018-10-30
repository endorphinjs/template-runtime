declare interface ComponentModel extends HTMLElement {
	/**
	 * Pointer to component view container. By default, it’s the same as component
	 * element, but for native Web Components it can point to shadow root
	 */
	readonly componentView: HTMLElement;

	/**
	 * Component properties (external contract)
	 */
	readonly props: object;

	/**
	 * Component state (internal props)
	 */
	readonly state: object;

	/**
	 * References to rendered elements
	 */
	readonly refs: RefMap;

	/**
	 * References to component slot containers. Default slot is available as `slot['']`
	 */
	readonly slots: RefMap;

	/**
	 * Updates props with data from `value`
	 * @param value Updated props
	 * @returns Final props
	 */
	setProps(value: object): object;

	/**
	 * Updates state with data from `value`
	 * @param value Updated values
	 * @returns Final state
	 */
	setState(value: object): object;
}

declare interface ComponentDefinition {
	/**
	 * Initial props factory
	 */
	props?(): object;

	/**
	 * Initial state factory
	 */
	state?(): object;

	/**
	 * Listeners for events bubbling from component contents
	 */
	events?(): object;

	/**
	 * Component created
	 */
	init?(component: ComponentModel): void;

	/**
	 * Component is about to be destroyed
	 */
	destroy?(component: ComponentModel): void;

	willMount?(): void;
	didMount?(): void;

	/**
	 * Component is about to be rendered. If `false` value is returned, component
	 * rendering will be cancelled
	 * @param updatedProps Updated props that caused component to re-render
	 * @param updatedState Updated state that caused component to re-render
	 * @param initial Initial component render (e.g. mounting)
	 */
	willRender?(updatedProps?: ChangeSet, updatedState?: ChangeSet, initial: boolean): boolean;

	/**
	 * Component just rendered
	 * @param updatedProps Updated props that caused component to re-render
	 * @param updatedState Updated state that caused component to re-render
	 * @param initial Initial component render (e.g. mounting)
	 */
	didRender?(updatedProps?: ChangeSet, updatedState?: ChangeSet, initial: boolean): void;

	/**
	 * Element is about to be animated
	 * @param elem Element being animated
	 * @param type Animation type: `in` or `out`
	 * @param animation Animation CSS property
	 */
	willAnimate?(elem: HTMLElement, type: string, animation: string);

	/**
	 * Element animation is finished
	 * @param elem Element being animated
	 * @param type Animation type: `in` or `out`
	 * @param animation Animation CSS property
	 */
	didAnimate?(elem: HTMLElement, type: string, animation: string): void;

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
