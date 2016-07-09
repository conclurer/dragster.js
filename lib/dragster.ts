import {IDragsterOptions, DrakeCloneConfigurator} from "./interfaces/dragster-options";
import {DragsterDefaultOptions} from "./dragster-default-options";
import {IDrake} from "./interfaces/drake";
import {IDragsterStartContext, IDragsterEvent} from "./interfaces/dragster-results";
import {getParentElement, getNextSibling, getImmediateChild, getElementForPosition} from "./helpers/node-functions";
import {Subject} from "rxjs/Subject";
import "rxjs/add/operator/filter";
import {DragonElement} from "./dragon-element";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/fromEvent";
import "rxjs/add/observable/merge";
import {getEventNames} from "./helpers/mouse-event-functions";

export class Dragster implements IDrake {
    // Instance variables
    // Currently dragged element
    protected draggedElement: DragonElement = null;
    protected originalElement: HTMLElement;
    protected originalContainer: HTMLElement;
    protected originalSibling: HTMLElement;

    // Options
    protected options: IDragsterOptions;

    // Watched containers
    public containers: HTMLElement[] = [];

    // Event Emitter
    protected emitter: Subject<IDragsterEvent> = new Subject<IDragsterEvent>();

    public constructor(options?: IDragsterOptions, ...containers: HTMLElement[]) {
        this.options = DragsterDefaultOptions;

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

    protected grab(event: MouseEvent): void {
        let context = this.startContext(<HTMLElement>event.target);
        if (context == null) return;

        // Save origin
        this.originalContainer = context.source;
        this.originalElement = context.item;
        this.originalSibling = getNextSibling(context.item);

        // Configure Dragon
        this.draggedElement = new DragonElement(context.item);
        this.draggedElement.dropTargetLocator = (element: HTMLElement, x: number, y: number) => this.findDropTarget(element, x, y);
        this.draggedElement.grab(event);
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

    // todo
    public destroy(): void {
    }

    protected drop(item: HTMLElement): void {
        let target = getParentElement(item);

        /** Remove original element if targetContainer is sourceContainer
         *  and copySortSource is enabled {@link IDragsterOptions#copySortSource}
         *  For the user, the original element has be re-arranged.
         *
        if (this.dragon.hasCopy() && this.options.copySortSource && target === this.dragon.source) {
            target.removeChild(this.dragon.item);
        }

        if (this.isInInitialPlacement(target)) {
            // Position of item was not changed ~> cancel
            this.emitter.next({
                channel: 'cancel',
                /** {@link DragsterCancelEventHandler} *
                data: [item, target, target]
            });
        }
        else {
            this.emitter.next({
                channel: 'drop',
                /** {@link DragsterDropEventHandler} *
                data: [item, target, this.dragon.source, this.dragon.currentSibling]
            })
        }

        // Cleanup temporary elements
        this.dragon.clean();
        // todo hook method for dropped item */
    }

    /**
     * Returns true if the given container and sibling match the initial container and sibling
     * @param container
     * @param sibling
     * @returns {boolean}
     */
    protected isInInitialPlacement(container: HTMLElement, sibling?: HTMLElement): boolean {
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

            let immediate = getImmediateChild(target, elementFlownOver);
            if (immediate == null) continue;

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