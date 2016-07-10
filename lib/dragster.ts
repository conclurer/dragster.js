import {IDragsterOptions, DrakeCloneConfigurator} from "./interfaces/dragster-options";
import {DragsterDefaultOptions} from "./dragster-default-options";
import {IDrake} from "./interfaces/drake";
import {IDragsterStartContext, IDragsterEvent} from "./interfaces/dragster-results";
import {
    getParentElement,
    getNextSibling,
    getImmediateChild,
    getElementForPosition,
    isInput
} from "./helpers/node-functions";
import {Subject} from "rxjs/Subject";
import "rxjs/add/operator/filter";
import {DragonElement} from "./dragon-element";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/fromEvent";
import "rxjs/add/observable/merge";
import {getEventNames} from "./helpers/mouse-event-functions";
import {Subscription} from "rxjs/Subscription";

export class Dragster implements IDrake {
    // Instance variables
    // Currently dragged element
    protected draggedElement: DragonElement = null;
    protected draggedElementEventSubscription: Subscription;
    protected originalElement: HTMLElement = null;
    protected originalContainer: HTMLElement = null;
    protected originalSibling: HTMLElement = null;

    // Options
    protected options: IDragsterOptions = new DragsterDefaultOptions();

    // Watched containers
    public containers: HTMLElement[] = [];

    // Event Emitter
    protected emitter: Subject<IDragsterEvent> = new Subject<IDragsterEvent>();

    public constructor(options?: IDragsterOptions, ...containers: HTMLElement[]) {
        // Apply given options
        for (let key in options) {
            if (!options.hasOwnProperty(key)) continue;
            this.options[key] = options[key];
        }

        // Apply containers
        this.containers = containers;

        // Setup events
        this.setupEvents();
    }

    // IDrake Fulfilment

    /**
     * Starts to drag one item
     * @param item
     */
    public start(item: HTMLElement): void {
        let context = this.startContext(item);
        if (context == null) return;

        /* Check if copying the source element is required
         if (this.requiresCopy(context.item, context.source)) {
         this.dragon.copy = <HTMLElement>context.item.cloneNode(true);
         this.emitter.next({
         channel: 'cloned',
         /** {@link DragsterClonedEventHandler} *
         data: [this.dragon.copy, context.item, 'copy']
         });
         }

         // Configure environment
         this.dragon.source = context.source;
         this.dragon.item = context.item;
         this.dragon.currentSibling = getNextSibling(context.item);
         this.dragon.initialSibling = this.dragon.currentSibling;
         this.dragging = true;

         // Emit drag event
         this.emitter.next({
         channel: 'drag',
         /** {@link DragsterDragEventHandler} *
         data: [context.item, context.source]
         }); */
    }

    /**
     * Grabs an element targeted by a mouse down event if element can be dragged
     * @param event
     */
    protected grab(event: MouseEvent): void {
        // Cancel if there is an element already being dragged
        if (this.draggedElement != null) return;

        let context = this.startContext(<HTMLElement>event.target);
        if (context == null) return;

        // Save origin
        this.originalContainer = context.source;
        this.originalElement = context.item;
        this.originalSibling = getNextSibling(context.item);

        // Configure Dragon
        this.draggedElement = new DragonElement(context.item);
        this.draggedElement.dropTargetLocator = (element: HTMLElement, x: number, y: number) => this.findDropTarget(element, x, y);
        this.draggedElement.dragster = this;

        // Pass over settings from this.options;
        let settingsToPass = ['ignoreInputTextSelection', 'removeOnSpill'];
        for (let setting of settingsToPass) {
            this.draggedElement[setting] = this.options[setting];
        }

        // Subscribe to Dragon events
        this.draggedElementEventSubscription = this.draggedElement.events().subscribe((event: IDragsterEvent) => {
            switch (event.channel) {
                // Drag Event
                case 'drag':
                    /** {@link DragsterDragEventHandler} */
                    this.emitMessage(event.channel, event.data.concat([this.originalContainer]));
                    break;

                case 'cloned':
                    /** {@link DragsterClonedEventHandler} */
                    this.emitMessage(event.channel, event.data);
                    break;

                case 'out':
                    /** {@link DragsterOutEventHandler} */
                    this.emitMessage(event.channel, event.data.concat([this.originalContainer]));
                    break;

                case 'over':
                    /** {@link DragsterOverEventHandler} */
                    this.emitMessage(event.channel, event.data.concat([this.originalContainer]));
                    break;

                case 'shadow':
                    /** {@link DragsterShadowEventHandler} */
                    this.emitMessage(event.channel, event.data.concat([this.originalContainer]));
                    break;

                case 'drop':
                    // Execute drop event handler
                    this.drop(event.data[0], event.data[1], event.data[2]);
                    break;

                case 'remove':
                    /** {@link DragsterRemoveEventHandler} */
                    this.emitMessage(event.channel, event.data.concat([this.originalContainer]));
                    break;

                case 'cancel':
                    this.emitMessage(event.channel, event.data.concat([this.originalContainer]));
                    break;

                case 'cancelBeforeDragging':
                    this.cleanup();
                    break;

                case 'dragend':
                    /** {@link DragsterDragEndEventHandler} */
                    this.emitMessage(event.channel, event.data);

                    // Cleanup this
                    this.cleanup();
                    break;
            }
        });

        // Start drag operation
        this.draggedElement.grab(event);

        // If triggering element is an inputfield element, focus it - else: cancel default
        if (event.type == 'mousedown') {
            let triggeringElement = <HTMLElement>event.target;

            if (isInput(triggeringElement)) triggeringElement.focus();
            else event.preventDefault();
        }
    }

    private emitMessage(channel: string, data: any[]): void {
        this.emitter.next({
            channel: channel,
            data: data
        });
    }

    /**
     * Stops dragging the currently dragged item
     */
    public end(): void {
        if (!this.dragging) return;

        // todo this.drop(this.dragon.draggedItem);
    }

    // todo
    public cancel(revert?: boolean): void {
    }

    // todo
    public remove(): void {
    }

    /**
     * Subscribes callback to any events for the requested channel
     * @param event
     * @param callback
     */
    public on(event: string, callback: Function): Dragster {
        this.emitter
            .filter((dragsterEvent: IDragsterEvent) => dragsterEvent.channel == event)
            .subscribe((dragsterEvent: IDragsterEvent) => callback(...dragsterEvent.data));

        return this;
    }

    /**
     * Returns a stream of all events of this Dragster instance
     * @returns {Observable<IDragsterEvent>}
     */
    public events(): Observable<IDragsterEvent> {
        return this.emitter.asObservable();
    }

    // todo
    public destroy(): void {
    }

    protected drop(item: HTMLElement, targetContainer: HTMLElement, currentSibling: HTMLElement): void {
        if (this.isInInitialPlacement(targetContainer, currentSibling)) {
            // Position of item was not changed ~> cancel
            this.emitter.next({
                channel: 'cancel',
                /** {@link DragsterCancelEventHandler} */
                data: [item, targetContainer, this.originalContainer]
            });
        }
        else {
            this.emitter.next({
                channel: 'drop',
                /** {@link DragsterDropEventHandler} */
                data: [item, targetContainer, this.originalContainer, currentSibling]
            });
        }
    }

    protected cleanup(): void {
        // Unsubscribe and remove draggedElement
        if (!this.draggedElementEventSubscription.isUnsubscribed) this.draggedElementEventSubscription.unsubscribe();
        this.draggedElementEventSubscription = null;
        this.draggedElement = null;

        // Clear instance variables
        this.originalContainer = null;
        this.originalElement = null;
        this.originalSibling = null;
    }

    /**
     * Returns true if the given container and sibling match the initial container and sibling
     * @param container
     * @param sibling
     * @returns {boolean}
     */
    public isInInitialPlacement(container: HTMLElement, sibling?: HTMLElement): boolean {
        let sib: HTMLElement;

        //Determine element to detect positioning
        if (sibling) sib = sibling;
        // todo else if (this.dragon.hasMirror()) sib = this.dragon.currentSibling;
        else sib = this.originalSibling;

        return container === this.originalContainer && sib === this.originalSibling;
    }

    /**
     * Determines the start context of the drag operation.
     * If the drag operation is invalid, null is returned.
     * @param item
     * @returns {IDragsterStartContext}
     */
    protected startContext(item: HTMLElement): IDragsterStartContext {
        // Cancel if there is something currently being dragged
        if (this.dragging) return null;

        // Cancel if the requested element is a container itself
        if (this.isContainer(item)) return null;

        // Detect element to drag
        let dragHandle = item;
        let parent: HTMLElement;
        do {
            parent = getParentElement(item);

            // Cancel if parent is null
            if (parent == null) return null;

            // Jump out if parent is a container
            if (this.isContainer(parent)) break;

            // Cancel if the parent element is marked as invalid
            if (this.options.invalid(item, dragHandle)) return null;

            // Apply parent
            item = parent;
            if (item == null) return null;
        } while (true);

        // Check if resulting item and parent are movable
        let sibling = getNextSibling(item);
        if (!this.options.moves(item, parent, dragHandle, sibling)) return null;

        return {item: item, source: parent};
    }

    /**
     * Returns true if the given item is a container of this
     * @param item
     */
    public isContainer(item: HTMLElement): boolean {
        return this.containers.indexOf(item) !== -1 || this.options.isContainer(item);
    }

    public currentSourceContainer(): HTMLElement {
        return this.originalContainer;
    }

    public currentSourceSibling(): HTMLElement {
        return this.originalSibling;
    }

    /**
     * Returns true if a copy is required for the given triggeringElement inside sourceContainer
     * @param triggeringItem
     * @param sourceContainer
     * @returns {boolean}
     */
    public requiresCopy(triggeringItem: HTMLElement, sourceContainer: HTMLElement): boolean {
        if (typeof this.options.copy === 'boolean') {
            return <boolean>this.options.copy;
        }
        else {
            return (<DrakeCloneConfigurator>this.options.copy)(triggeringItem, sourceContainer);
        }
    }

    protected findDropTarget(elementFlownOver: HTMLElement, mouseX: number, mouseY: number): HTMLElement {
        let target: HTMLElement = elementFlownOver;

        do {
            // Skip if the given element is not a valid container element
            if (!this.isContainer(target)) {
                target = getParentElement(target);
                continue;
            }

            // Detect immediate child element of target, cancel if it does not exist
            let immediate = getImmediateChild(target, elementFlownOver);
            if (immediate == null) return null;

            let elementAtPosition = getElementForPosition(target, immediate, mouseX, mouseY, this.options.direction);

            // An element should always be allowed to drop back to its origin
            if (this.isInInitialPlacement(target, elementAtPosition)) break;

            // Use options to detect if able to drop
            if (this.options.accepts(this.originalElement, target, this.originalContainer, elementAtPosition)) break;

        } while (target != null);

        return target;
    }

    /**
     * Returns true if there is an item currently being dragged
     * @returns {boolean}
     */
    public get dragging(): boolean {
        if (this.draggedElement == null) return false;
        return this.draggedElement.isDragging();
    }

    protected setupEvents(): void {
        // Subscribe to mousedown events to trigger Dragon
        let mouseDownEvents = getEventNames('mousedown').map((eventName: string) => Observable.fromEvent(document.documentElement, eventName));

        Observable.merge(...mouseDownEvents).subscribe(
            (mouseDownEvent: MouseEvent) => this.grab(mouseDownEvent)
        );
    }
}