import {IDragsterOptions, DrakeCloneConfigurator} from './interfaces/dragster-options';
import {DragsterDefaultOptions} from './dragster-default-options';
import {IDrake} from './interfaces/drake';
import {IDragsterStartContext, IDragsterEvent} from './interfaces/dragster-results';
import {getParentElement, getNextSibling, isInput} from './helpers/node-functions';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/operator/filter';
import {DragonElement} from './dragon-element';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import {getEventNames} from './helpers/mouse-event-functions';
import {Subscription} from 'rxjs/Subscription';
import {IDragsterOptionsForced} from './interfaces/dragster-options-forced';
import {DragonCloneElement} from './dragon-clone-element';

export class Dragster implements IDrake {
    // Instance variables
    // Currently dragged element
    protected draggedElement: DragonElement | null = null;
    protected draggedElementEventSubscription: Subscription | null = null;

    // Options
    protected options: IDragsterOptionsForced = new DragsterDefaultOptions();

    // Watched containers
    public containers: HTMLElement[] = [];

    // Event Emitter
    protected emitter: Subject<IDragsterEvent> = new Subject<IDragsterEvent>();

    public constructor(options: IDragsterOptions, ...containers: HTMLElement[]) {
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
        let context: IDragsterStartContext | null = this.startContext(item);
        if (context == null) return;

        // Trigger Start
        this.triggerStart(context);

        // Cancel if start failed
        if (this.draggedElement == null) return;

        // Start forceStart operation
        this.draggedElement.forceStart();
    }

    /**
     * Grabs an element targeted by a mouse down event if element can be dragged
     * @param event
     */
    protected grab(event: MouseEvent): void {
        // Cancel if there is an element already being dragged
        if (this.draggedElement != null) return;

        let context: IDragsterStartContext | null = this.startContext(<HTMLElement>event.target);
        if (context == null) return;

        // Trigger Start
        this.triggerStart(context);

        // Cancel if start failed
        if (this.draggedElement == null) return;

        // Start drag operation
        this.draggedElement.grab(event);

        // If triggering element is an inputfield element, focus it - else: cancel default
        if (event.type === 'mousedown') {
            let triggeringElement: HTMLElement = <HTMLElement>event.target;

            if (isInput(triggeringElement)) triggeringElement.focus();
            else event.preventDefault();
        }
    }

    protected triggerStart(context: IDragsterStartContext): void {
        // Configure Dragon
        // Check if copy is required (will create clone)
        if (this.requiresCopy(context.item, context.source)) {
            this.draggedElement = new DragonCloneElement(context.item, this.options, this);
        }
        else {
            this.draggedElement = new DragonElement(context.item, this.options, this);
        }

        this.draggedElement.setOrigin(context.source, getNextSibling(context.item));

        // Subscribe to Dragon events
        this.draggedElementEventSubscription = this.draggedElement.events().subscribe((dragsterEvent: IDragsterEvent) => {
            switch (dragsterEvent.channel) {
                // Drag Event
                case 'drag':
                case 'cloned':
                case 'out':
                case 'over':
                case 'shadow':
                case 'remove':
                case 'cancel':
                case 'drop':
                    this.emitter.next({channel: dragsterEvent.channel, data: dragsterEvent.data});
                    break;

                case 'cancelBeforeDragging':
                    this.cleanup();
                    break;

                case 'dragend':
                    /** {@link DragsterDragEndEventHandler} */
                    this.emitter.next({channel: dragsterEvent.channel, data: dragsterEvent.data});

                    // Cleanup this
                    this.cleanup();
                    break;
            }
        });
    }

    /**
     * Stops dragging the currently dragged item
     */
    public end(): void {
        if (!this.dragging) return;

        // todo this.drop(this.dragon.draggedItem);
    }

    public cancel(revert: boolean = false): void {
        // Cancel operation if this.draggedElement is null
        if (this.draggedElement == null) return;

        this.draggedElement.cancel(revert);
        // this.cleanup();
    }

    public remove(): void {
        return;
        // todo
    }

    /**
     * Subscribes callback to any events for the requested channel
     * @param event
     * @param callback
     */
    public on(event: string, callback: Function): Dragster {
        this.emitter
            .filter((dragsterEvent: IDragsterEvent) => dragsterEvent.channel === event)
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

    public destroy(): void {
        // todo
        return;
    }

    protected cleanup(): void {
        // Unsubscribe and remove draggedElement
        if (this.draggedElementEventSubscription != null && !this.draggedElementEventSubscription.isUnsubscribed) {
            this.draggedElementEventSubscription.unsubscribe();
        }

        this.draggedElementEventSubscription = null;
        this.draggedElement = null;
    }

    /**
     * Determines the start context of the drag operation.
     * If the drag operation is invalid, null is returned.
     * @param item
     * @returns {IDragsterStartContext}
     */
    protected startContext(item: HTMLElement): IDragsterStartContext | null {
        // Cancel if there is something currently being dragged
        if (this.dragging) return null;

        // Cancel if the requested element is a container itself
        if (this.isContainer(item)) return null;

        // Detect element to drag
        let dragHandle: HTMLElement = item;
        let parent: HTMLElement | null;
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
        let sibling: HTMLElement | null = getNextSibling(item);
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
        let mouseDownEvents: Observable<Event>[] = getEventNames('mousedown').map((eventName: string) => Observable.fromEvent(document.documentElement, eventName));

        Observable.merge(...mouseDownEvents).subscribe(
            (mouseDownEvent: MouseEvent) => this.grab(mouseDownEvent)
        );
    }
}
