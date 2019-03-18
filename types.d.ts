import { Store } from './lib/store';

declare global {
	type InjectorNode = Node;
	type InjectorItem = any;

	interface DisposeCallback {
		(scope: object): void
	}

	interface BlockDisposeCallback {
		(block: BaseBlock): void;
	}

	interface Component extends HTMLElement {
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
		props: object;

		/**
		 * Component state (internal props)
		 */
		state: object;

		/**
		 * Named references to elements rendered inside current component
		 */
		refs: RefMap;

		/**
		 * A store, bound to current component
		 */
		store?: Store;

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
	interface ComponentModel {
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
		update?: UpdateView;

		/**
		 * List of attached event handlers
		 */
		events: AttachedEventsMap;

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
		queued: Promise;

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
		dispose?: DisposeCallback
	}

	/**
	 * A definition of component, written as ES module
	 */
	interface ComponentDefinition {
		/**
		 * Initial props factory
		 */
		props?(): object;

		/**
		 * Initial state factory
		 */
		state?(): object;

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
			[type: string]: (component: Component, event: Event, target: HTMLElement) => void;
		};

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
		default(component: Component, scope: object): UpdateView;

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
		 * @param component
		 */
		didMount?(component: Component): void;

		/**
		 * Component props changed
		 */
		didChange?(component: Component, changes: Changes): void;

		/**
		 * Component is about to be updated (next renders after mount)
		 * @param component
		 * @param changedProps List of changed properties which caused component update
		 * @param changedState List of changed state which caused component update
		 */
		willUpdate?(component: Component, changes: Changes): void;

		/**
		 * Component just updated (next renders after mount)
		 * @param component
		 * @param changedProps List of changed properties which caused component update
		 * @param changedState List of changed state which caused component update
		 */
		didUpdate?(component: Component, changes: Changes): void;

		/**
		 * Component is about to be rendered. If `false` value is returned, component
		 * rendering will be cancelled
		 * @param component
		 * @param changedProps List of changed properties which caused component update
		 * @param changedState List of changed state which caused component update
		 */
		willRender?(component: Component, changes: Changes): boolean;

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
	}

	interface Injector {
		/**
		 * Injector DOM target
		 */
		parentNode: Element;

		/**
		 * Current injector contents
		 */
		items: LinkedList;

		/**
		 * Current insertion pointer
		 */
		ptr: LinkedListItem<any>;

		/**
		 * Current block context
		 */
		ctx: BaseBlock;

		/**
		 * Slots container
		 */
		slots?: {
			[name: string]: DocumentFragment | Element
		};

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

	interface AttachedEventsMap {
		[event: string]: {
			listeners: Function[];
			handler: EventListener;
		}
	}

	interface RefMap {
		[key: string]: Element;
	}

	interface ChangeSet {
		prev: object;
		cur: object;
	}

	interface Changes {
		[key: string]: {
			current: any,
			prev: any
		}
	};

	interface UpdateView {
		(host: Component, scope: object): void;
	}

	interface SlotContext {
		host: Component;
		name: string;
		isDefault: boolean;
		defaultContent: Function;
	}

	interface StoreUpdateHandler {
		(state: object, changes: object): void
	}

	interface StoreUpdateEntry {
		keys?: string[];
		component?: Component;
		handler?: StoreUpdateHandler;
	}

	interface LinkedList {
		head: LinkedListItem;
	}

	interface LinkedListItem<T> {
		value: T;
		next: LinkedListItem<any> | null;
		prev: LinkedListItem<any> | null;
	}

	interface BaseBlock<T> {
		$$block: true;
		host: Component;
		injector: Injector;
		scope: any;

		/** A function to dispose block contents */
		dispose: BlockDisposeCallback | null;

		start: LinkedListItem<T>;
		end: LinkedListItem<T>;
	}

	interface FunctionBlock extends BaseBlock<FunctionBlock> {
		get: Function;
		fn: Function | undefined;
		update: Function | undefined;
	}

	interface IteratorBlock extends BaseBlock<IteratorBlock> {
		get: Function;
		body: Function;
		index: number;
		updated: number;
	}

	interface KeyIteratorBlock extends IteratorBlock {
		keyExpr: Function;
		used: {
			[key: string]: IteratorItemBlock[]
		} | null;
		rendered: {
			[key: string]: IteratorItemBlock[]
		} | null;
		order: IteratorItemBlock[];
		needReorder: boolean;
		localScope: {
			index: number,
			key: any,
			value: any
		}
	}

	interface IteratorItemBlock extends BaseBlock<IteratorItemBlock> {
		update: Function | undefined;
		owner: IteratorBlock | KeyIteratorBlock;
	}

	interface InnerHtmlBlock extends BaseBlock<InnerHtmlBlock> {
		get: Function;
		code: any;
		slotName: string;
	}

	interface PartialBlock extends BaseBlock<PartialBlock> {
		childScope: Object;
		update: Function | null;
		partial: Object | null;
	}
}
