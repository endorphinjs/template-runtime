type InjectorNode = Node;
type InjectorItem = any;
type ComponentEventHandler = (component: Component, event: Event, target: HTMLElement) => void;
type StaticEventHandler = (evt: Event) => void;
type Scope = { [key: string]: any };

type RunCallback<D = any, R = undefined | null> = (host: Component, injector: Injector, data?: D) => R;
type GetMount = (host: Component, scope: Scope) => MountBlock | undefined;
type MountTemplate = (host: Component, scope: Scope) => UpdateTemplate | undefined;
type UpdateTemplate = (host: Component, scope: Scope) => number | void;
type MountBlock<D = Scope> = (host: Component, injector: Injector, data: D) => UpdateBlock | void;
type UpdateBlock<D = Scope> = (host: Component, injector: Injector, data: D) => number | void;
type UnmountBlock = (scope: Scope) => void;

interface Data {
	[key: string]: any;
}

export interface Component<P = Data, S = Data, T = Store> extends HTMLElement {
	/**
	 * Pointer to component view container. By default, it’s the same as component
	 * element, but for native Web Components it points to shadow root
	 */
	componentView: Element;

	/**
	 * Internal component model
	 */
	componentModel: ComponentModel;

	/**
	 * Component properties (external contract)
	 */
	props: P;

	/**
	 * Component state (internal props)
	 */
	state: S;

	/**
	 * Named references to elements rendered inside current component
	 */
	refs: RefMap;

	/**
	 * A store, bound to current component
	 */
	store?: T;

	/**
	 * References to component slot containers. Default slot is available as `slot['']`
	 */
	slots: RefMap;

	/**
	 * Reference to the root component of the current app
	 */
	root?: Component;

	/**
	 * Updates props with data from `value`
	 * @param value Updated props
	 * @returns Final props
	 */
	setProps(value: object): void;

	/**
	 * Updates state with data from `value`
	 * @param value Updated values
	 * @returns Final state
	 */
	setState(value: object): void;
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
	 * A function for updating rendered component content. Might be available
	 * after component was mounted and only if component has update cycle
	 */
	update?: UpdateTemplate | undefined;

	/**
	 * List of attached event handlers
	 */
	events?: AttachedStaticEvents;

	/** Slot output for component */
	slots: {
		[name: string]: BaseBlock
	}

	/**
	 * Slots update status
	 */
	slotStatus?: {
		[name: string]: number
	};

	/**
	 * Indicates that component was mounted
	 * @private
	 */
	mounted: boolean;

	/**
	 * Component render is queued
	 * @private
	 */
	queued: boolean;

	/**
	 * Indicates that component is currently rendering
	 * @private
	 */
	rendering: boolean;

	/**
	 * Indicates that component is currently in finalization state (calling
	 * `did*` hooks)
	 * @private
	 */
	finalizing: boolean;

	/**
	 * Default props values
	 */
	defaultProps: object;

	/**
	 * A function for disposing component contents
	 */
	dispose?: UnmountBlock
}

/**
 * A definition of component, written as ES module
 */
export interface ComponentDefinition {
	/**
	 * Initial props factory
	 */
	props?(component: Component): {};

	/**
	 * Initial state factory
	 */
	state?(component: Component): {};

	/**
	 * Returns instance of store used for components
	 */
	store?(): Store;

	/**
	 * Returns pointer to element where contents of component should be rendered
	 */
	componentView?(component: Component, parentComponent?: Component | Element): Element;

	/**
	 * Listeners for events bubbling from component contents
	 */
	events?: {
		[type: string]: ComponentEventHandler;
	};

	/**
	 * Public methods to attach to component element
	 * @deprecated Use `extend` instead
	 */
	methods?: {
		[name: string]: (this: Component) => void;
	};

	/**
	 * Methods and properties to extend component with
	 */
	extend?: object;

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
	default?: MountTemplate;

	/**
	 * Component created
	 */
	init?(component: Component): void;

	/**
	 * Component is about to be mounted (will be initially rendered)
	 */
	willMount?(component: Component): void;

	/**
	 * Component just mounted (initially rendered)
	 */
	didMount?(component: Component): void;

	/**
	 * Component props changed
	 */
	didChange?(component: Component, changes: Changes): void;

	/**
	 * Component is about to be updated (next renders after mount)
	 * @param component
	 * @param changes List of changed properties which caused component update
	 */
	willUpdate?(component: Component, changes: Changes): void;

	/**
	 * Component just updated (next renders after mount)
	 * @param component
	 * @param changes List of changed properties which caused component update
	 */
	didUpdate?(component: Component, changes: Changes): void;

	/**
	 * Component is about to be rendered. If `false` value is returned, component
	 * rendering will be cancelled
	 * @param component
	 * @param changes List of changed properties which caused component update
	 */
	willRender?(component: Component, changes: Changes): void;

	/**
	 * Component just rendered
	 * @param component
	 * @param changedProps List of changed properties which caused component update
	 * @param changedState List of changed state which caused component update
	 */
	didRender?(component: Component, changes: Changes): void;

	/**
	 * Component is about to be removed
	 */
	willUnmount?(component: Component): void;

	/**
	 * Component was removed
	 */
	didUnmount?(component: Component): void;

	[key: string]: any;
}

export class Store<T = Data> {
	constructor(data: T);
	data: T;
	get(): T;
	set(value: T): void;
	subscribe(handler: StoreUpdateHandler, keys?: string[]): StoreUpdateEntry;
	unsubscribe(entry: StoreUpdateEntry): void;
	watch(component: Component, keys?: string[]): void;
	unwatch(component: Component): void;
}

interface Injector {
	/**
	 * Injector DOM target
	 */
	parentNode: Element;

	/**
	 * Current injector contents
	 */
	items: LinkedList<any>;

	/**
	 * Current insertion pointer
	 */
	ptr: LinkedListItem<any> | null;

	/**
	 * Current block context
	 */
	ctx: BaseBlock<any> | null;

	/**
	 * Slots container
	 */
	slots?: {
		[name: string]: DocumentFragment | Element
	} | null;

	/**
	 * Pending attributes updates
	 */
	attributes: ChangeSet;

	attributesNS?: {
		[uri: string]: ChangeSet
	}

	/**
	 * Current event handlers
	 */
	events: ChangeSet;
}

interface AttachedStaticEvents {
	handler: StaticEventHandler;
	listeners: {
		[event: string]: ComponentEventHandler[];
	}
}

interface RefMap {
	[key: string]: Element;
}

interface ChangeSet {
	prev: any;
	cur: any;
}

export interface Changes {
	[key: string]: {
		current: any,
		prev: any
	}
}

interface SlotContext {
	host: Component;
	name: string;
	isDefault: boolean;
	defaultContent?: MountBlock;
}

interface StoreUpdateHandler {
	(state: any, changes: object): void
}

interface StoreUpdateEntry {
	keys?: string[];
	component?: Component;
	handler?: StoreUpdateHandler;
}

interface LinkedList<T = any> {
	head: LinkedListItem<T> | null;
}

interface LinkedListItem<T> {
	value: T;
	next: LinkedListItem<T> | null;
	prev: LinkedListItem<T> | null;
}

interface BaseBlock<T = any> {
	$$block: true;
	host: Component;
	injector: Injector;
	scope: Scope;

	/** A function to dispose block contents */
	dispose: UnmountBlock | null;

	start: LinkedListItem<T>;
	end: LinkedListItem<T>;
}

type RenderItems = (host: Component, scope: Scope) => any[];
type KeyExpr = (host: Component, scope?: Scope) => string;

interface FunctionBlock extends BaseBlock<FunctionBlock> {
	get: GetMount;
	fn?: MountBlock | void;
	update?: UpdateBlock | void;
}

interface IteratorBlock extends BaseBlock<IteratorBlock> {
	get: RenderItems;
	body: MountBlock;
	index: number;
	updated: number;
}

interface KeyIteratorBlock extends IteratorBlock {
	keyExpr: KeyExpr;
	used: {
		[key: string]: IteratorItemBlock[]
	} | null;
	rendered: {
		[key: string]: IteratorItemBlock[]
	} | null;
	order: IteratorItemBlock[];
	needReorder: boolean;
	parentScope: Scope;
}

interface IteratorItemBlock extends BaseBlock<IteratorItemBlock> {
	update: UpdateBlock | void;
	owner: IteratorBlock | KeyIteratorBlock;
}

interface InnerHtmlBlock extends BaseBlock<InnerHtmlBlock> {
	get: GetMount;
	code: any;
	slotName: string;
}

interface PartialBlock extends BaseBlock<PartialBlock> {
	update: UpdateBlock | void;
	partial: PartialDefinition | null;
}

interface PartialDefinition {
	host: Component;
	body: MountBlock;
	defaults: object;
}
