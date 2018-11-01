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

/**
 * A definition of component, written as ES module
 */
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
	events?: object;

	/**
	 * List of nested components used by current one
	 */
	components?: object;

	/**
	 * Public methods to attach to component element
	 */
	methods?: { [name: string]: function };

	/**
	 * A function for rendering component contents. Will be added automatically
	 * in compilation step
	 */
	render: function;

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
}

declare interface ComponentContainer {
	element: ComponentModel;
	definition: ComponentDefinition;
	injector: Injector;
	scope: Scope;
	update?: function;
}

interface RefMap {
	[key: string]: HTMLElement;
}

interface ChangeSet {
	prev: object;
	next: object;
}
