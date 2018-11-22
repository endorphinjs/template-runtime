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
	events?: { [type: string]: function };

	/**
	 * List of nested components used by current one
	 */
	components?: object;

	/**
	 * Public methods to attach to component element
	 */
	methods?: { [name: string]: function };

	/**
	 * List of plugins for current component
	 */
	plugins?: ComponentDefinition[];

	/**
	 * A function for rendering component contents. Will be added automatically
	 * in compilation step with compoled HTML template, if not provided
	 */
	default?: function;

	/**
	 * Component created
	 */
	init?(component: ComponentModel): void;

	/**
	 * Component is about to be destroyed
	 */
	destroy?(component: ComponentModel): void;

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
	didRender?(component: ComponentModel, changedProps?: ChangeSet, changedState?: ChangeSet, initial: boolean): void;
}

declare interface Component {
	/**
	 * Component’s DOM element
	 */
	element: ComponentModel;

	/**
	 * Component’s definition
	 */
	definition: ComponentDefinition;

	/**
	 * Injector for incoming component data
	 */
	input: Injector;

	/**
	 * Change set for component refs
	 */
	refs: ChangeSet;

	/**
	 * Runtime variables
	 */
	vars: object;

	/**
	 * A function for updating rendered component content. Becomes available
	 * after component was mounted
	 */
	update?: function;

	/**
	 * Indicates that component was mounted
	 */
	mounted: boolean;

	/**
	 * Indicates that component is currently rendering
	 */
	rendering: boolean;
}

declare interface Injector {
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
declare interface Block {
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
