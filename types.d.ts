export interface Component extends HTMLElement {
	/**
	 * Pointer to component view container. By default, it’s the same as component
	 * element, but for native Web Components it points to shadow root
	 */
	componentView: HTMLElement | ShadowRoot;

	/**
	 * Internal component model
	 */
	readonly componentModel: ComponentModel;

	/**
	 * Component properties (external contract)
	 */
	readonly props: object;

	/**
	 * Component state (internal props)
	 */
	readonly state: object;

	/**
	 * Named references to elements rendered inside current component
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
 * Internal Endorphin component descriptor
 */
export interface ComponentModel {
	/**
	 * Component’s definition
	 */
	definition: ComponentDefinition;

	/**
	 * Injector for incoming component data
	 * @private
	 */
	input: Injector;

	/**
	 * Change set for component refs
	 * @private
	 */
	refs: ChangeSet;

	/**
	 * Runtime variables
	 */
	vars: object;

	/**
	 * List of redefined partials
	 */
	partials: {
		[name: string]: (host: Component, injector: Injector) => void;
	}

	/**
	 * A function for updating rendered component content. Might be available
	 * after component was mounted and only if component has update cycle
	 */
	update?: UpdateView;

	/**
	 * Detaches all static events bound to current component
	 * @private
	 */
	detachEvents(): void;

	/**
	 * Indicates that component was mounted
	 */
	mounted: boolean;

	/**
	 * Indicates that component is currently rendering
	 * @private
	 */
	rendering: boolean;
}

/**
 * A definition of component, written as ES module
 */
export interface ComponentDefinition {
	/**
	 * Initial props factory
	 */
	props?(): object;

	/**
	 * Initial state factory
	 */
	state?(): object;

	/**
	 * Returns pointer to element where contents of component should be rendered
	 * @param parent
	 */
	componentView?(parent?: Component | Element): Element;

	/**
	 * Listeners for events bubbling from component contents
	 */
	events?: {
		[type: string]: (event: Event, component: Component) => void;
	};

	/**
	 * List of nested components used by current one
	 */
	components?: object;

	/**
	 * Public methods to attach to component element
	 */
	methods?: {
		[name: string]: (this: Component) => void;
	};

	/**
	 * List of plugins for current component
	 */
	plugins?: ComponentDefinition[];

	/**
	 * A scope token to be added for every element, created inside current component
	 * bound
	 */
	cssScope?: string;

	/**
	 * A function for rendering component contents. Will be added automatically
	 * in compilation step with compiled HTML template, if not provided.
	 * If rendered result must be updated, should return function that will be
	 * invoked for update
	 */
	default(component: Component): UpdateView;

	/**
	 * Component created
	 */
	init?(component: ComponentModel): void;

	/**
	 * Component is about to be mounted (will be initially rendered)
	 * @param component
	 */
	willMount?(component: ComponentModel): void;

	/**
	 * Component just mounted (initially rendered)
	 * @param component
	 */
	didMount?(component: ComponentModel): void;

	/**
	 * Component is about to be updated (next renders after mount)
	 * @param component
	 * @param changedProps List of changed properties which caused component update
	 * @param changedState List of changed state which caused component update
	 */
	willUpdate?(component: ComponentModel, changedProps: ChangeSet, changedState: ChangeSet): void;

	/**
	 * Component just updated (next renders after mount)
	 * @param component
	 * @param changedProps List of changed properties which caused component update
	 * @param changedState List of changed state which caused component update
	 */
	didUpdate?(component: ComponentModel, changedProps: ChangeSet, changedState: ChangeSet): void;

	/**
	 * Component is about to be rendered. If `false` value is returned, component
	 * rendering will be cancelled
	 * @param component
	 * @param changedProps List of changed properties which caused component update
	 * @param changedState List of changed state which caused component update
	 */
	willRender?(component: ComponentModel, changedProps?: ChangeSet, changedState?: ChangeSet): boolean;

	/**
	 * Component just rendered
	 * @param component
	 * @param changedProps List of changed properties which caused component update
	 * @param changedState List of changed state which caused component update
	 */
	didRender?(component: ComponentModel, changedProps?: ChangeSet, changedState?: ChangeSet): void;

	/**
	 * Component is about to be removed
	 */
	willUnmount?(component: ComponentModel): void;

	/**
	 * Component was removed
	 */
	didUnmount?(component: ComponentModel): void;
}

interface Injector {
	/**
	 * Injector DOM target
	 */
	parentNode: Element;

	/**
	 * Current injector contents
	 */
	items: Node[] | Block[];

	/**
	 * Current insertion pointer
	 */
	ptr: number;

	/**
	 * Current block context
	 */
	ctx: Block;

	/**
	 * Slots container
	 */
	slots: object;

	/**
	 * Pending attributes updates
	 */
	attributes: ChangeSet;

	/**
	 * Current event handlers
	 */
	events: ChangeSet;
}

/**
 * A structure that holds data about elements owned by given block context
 * right below it in `Injector` list
 */
interface Block {
	/**
	 * Number of inserted items in block context
	 */
	inserted: number;

	/**
	 * Number of deleted items in block context
	 */
	deleted: number;

	/**
	 * Amount of items in current block
	 */
	size: number;
}

interface RefMap {
	[key: string]: HTMLElement;
}

interface ChangeSet {
	prev: object;
	next: object;
}

interface UpdateView {
	(): void;
}
