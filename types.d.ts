import { Store } from './lib/store';

declare global {
	type InjectorNode = Node;
	type InjectorItem = any;

	interface Component extends Element {
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
		setProps(value: object, silent?: boolean): void;

		/**
		 * Updates state with data from `value`
		 * @param value Updated values
		 * @returns Final state
		 */
		setState(value: object, silent: boolean): void;
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
			[name: string]: BlockContext
		}

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
		items: InjectorItem[];

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
	type Block = {
		/** @private */
		'&block': true;

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
			next: any,
			prev: any
		}
	};

	interface UpdateView {
		(host: Component, scope: object): void;
	}

	interface BlockContext {
		component: Component;
		injector: Injector;
		block: Block,
		get: Function;
		fn?: Function,
		update?: Function,
	}

	interface StoreUpdateHandler {
		(state: object, changes: object): void
	}

	interface StoreUpdateEntry {
		keys?: string[];
		component?: Component;
		handler?: StoreUpdateHandler;
	}
}
