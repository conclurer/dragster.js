import {whichMouseButton, getEventNames} from './helpers/mouse-event-functions';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/takeUntil';
import {Subject} from 'rxjs/Subject';
import {IDragsterEvent, IDragonItemCoordinates, IDragonDropZone} from './interfaces/dragster-results';
import {
    getElementBehindPoint,
    getImmediateChild,
    getElementForPosition,
    getNextSibling,
    isInput,
    getParentElement
} from './helpers/node-functions';
import {IDragsterOptionsForced} from './interfaces/dragster-options-forced';
import {Dragster} from './dragster';

/**
 * DragonElement
 * Dragster's dragon'drop handler for one HTMLElement
 */
export class DragonElement {
    // HTML Element to watch
    protected item: HTMLElement;
    protected itemOriginalCoordinates: IDragonItemCoordinates;

    // Item dragged instead of original
    protected flyingItem: HTMLElement | null = null;

    // Item displayed inside a potential drop zone
    protected shadowItem: HTMLElement | null = null;

    // If true, the drag operation has been cancelled by the user
    protected cancelled: boolean = false;

    // If true, the user is currently dragging this.item
    protected dragging: boolean = false;

    // Item Move Stream
    protected itemMoveStream: Subscription;
    protected mouseCoordinatesOnStart: IDragonItemCoordinates | null;
    protected currentMouseCoordinates: IDragonItemCoordinates | null;
    protected lastDropTarget: HTMLElement | null = null;
    protected currentSibling: HTMLElement | null;

    // Event Emitter
    protected emitter: Subject<IDragsterEvent> = new Subject<IDragsterEvent>();

    // Configuration
    protected options: IDragsterOptionsForced;

    // This is where this.item originally came from
    protected originalContainer: HTMLElement;

    // This is this.item's original sibling, null if this.item was the last element inside this.originalContainer
    protected originalSibling: HTMLElement | null;

    // Link to Dragster instance of origin
    protected dragster: Dragster;

    public constructor(item: HTMLElement, options: IDragsterOptionsForced, dragster: Dragster) {
        this.item = item;
        this.options = options;
        this.dragster = dragster;
    }

    /**
     * Sets the origin of the item being dragged
     * @param originalContainer
     * @param originalSibling
     */
    public setOrigin(originalContainer: HTMLElement, originalSibling: HTMLElement | null): void {
        this.originalContainer = originalContainer;
        this.originalSibling = originalSibling;
    }

    /**
     * Returns true if the given container and sibling match the initial container and sibling
     * @param container
     * @param sibling
     * @returns {boolean}
     */
    protected isInInitialPlacement(container: HTMLElement | null, sibling?: HTMLElement | null): boolean {
        let sib: HTMLElement | null;

        // Determine element to detect positioning
        if (sibling) sib = sibling;
        else sib = this.originalSibling;

        return container === this.originalContainer && sib === this.originalSibling;
    }

    /**
     * Marks the this.item as grabbed. If the user starts to move their mouse the element will be dragged.
     * @param e
     */
    public grab(e: MouseEvent): void {
        // Save mouse coordinates of start
        this.mouseCoordinatesOnStart = {x: e.clientX, y: e.clientY};

        // Setup stream
        this.setupStream();
    }

    /**
     * Forces starts dragging this.item.
     */
    public forceStart(): void {
        this.setupStream();
    }

    public forceRelease(): void {
        if (this.currentMouseCoordinates == null) return;
        this.release(this.currentMouseCoordinates.x, this.currentMouseCoordinates.y);
    }

    /**
     * Returns true if this.item is currently being dragged.
     * @returns {boolean}
     */
    public isDragging(): boolean {
        return this.dragging;
    }

    /**
     * Returns true if dragging this.item has been cancelled.
     * @returns {boolean}
     */
    public isCancelled(): boolean {
        return this.cancelled;
    }

    /**
     * Returns a stream of all events triggered by this.
     * @returns {Observable<IDragsterEvent>}
     */
    public get events$(): Observable<IDragsterEvent> {
        return this.emitter.asObservable();
    }

    /**
     * Sets up event streams to oversee the user's interactions and react to them.
     */
    protected setupStream(): void {
        let moveEvents$ = getEventNames('mousemove').map((eventName: string) => {
            return Observable.fromEvent(document.documentElement, eventName);
        });

        let upEvents$ = getEventNames('mouseup').map((eventName: string) => {
            return Observable.fromEvent(document.documentElement, eventName);
        });

        // Subscribe to user's mouse move events
        this.itemMoveStream = Observable.merge(...moveEvents$)
        // Cancel when the user stops to
            .takeUntil(Observable.merge(...upEvents$))
            .subscribe(
                // Executed whenever the user moves this.item
                (itemMovedEvent: MouseEvent) => {
                    // Cancel if cancelled
                    if (this.isCancelled()) return;

                    // Save mouse coordinates
                    this.currentMouseCoordinates = {
                        x: itemMovedEvent.clientX,
                        y: itemMovedEvent.clientY
                    };

                    // Cancel dragging if wrong mouse button is pressed
                    // Only possibility to detect mouse up in Inputfields
                    if (whichMouseButton(itemMovedEvent) === 0) {
                        this.release(this.currentMouseCoordinates.x, this.currentMouseCoordinates.y);
                        return;
                    }

                    // Text selection inside an Input-like HTMLElement
                    // If Dragster is configured to ignoreInputTextSelection, cancel event
                    if (this.options.ignoreInputTextSelection && !this.isDragging()) {
                        let elementBehindCursor = <HTMLElement>document.elementFromPoint(this.currentMouseCoordinates.x, this.currentMouseCoordinates.y);
                        if (isInput(elementBehindCursor)) {
                            this.release(this.currentMouseCoordinates.x, this.currentMouseCoordinates.y);
                            return;
                        }
                    }

                    // Initialize dragging
                    if (!this.isDragging()) this.initializeDrag();

                    // Prevent default behavior
                    itemMovedEvent.preventDefault();

                    // Set mouseCoordinatesOnStart if not present
                    if (this.mouseCoordinatesOnStart == null) {
                        this.mouseCoordinatesOnStart = {
                            x: this.currentMouseCoordinates.x,
                            y: this.currentMouseCoordinates.y
                        };
                    }

                    // Detect and apply coordinate changes
                    // elementInner: Coordinates of the element including offset of curser to element borders
                    let elementInnerX = this.itemOriginalCoordinates.x + (this.mouseCoordinatesOnStart.x - this.itemOriginalCoordinates.x);
                    let elementInnerY = this.itemOriginalCoordinates.y + (this.mouseCoordinatesOnStart.y - this.itemOriginalCoordinates.y);

                    // Calculate total x/y position
                    let x = this.currentMouseCoordinates.x - elementInnerX;
                    let y = this.currentMouseCoordinates.y - elementInnerY;

                    // Cancel if there is no flying item
                    if (this.flyingItem == null) return;

                    // Apply style to flyingElement
                    this.flyingItem.style.transform = `translate(${x}px, ${y}px)`;

                    // Detect DropZones below
                    this.detectDropZone(itemMovedEvent.clientX, itemMovedEvent.clientY);
                },
                // tslint:disable-next-line
                (error) => console.error(error),

                // Executed when the user stops to drag one element
                () => {
                    console.log('complete', this.currentMouseCoordinates);
                    // Cancel if there are no current mouse coordinates
                    if (this.currentMouseCoordinates == null) {
                        // Item has not been dragged anywhere, cleanup immediately
                        this.cleanup();
                        return;
                    }

                    console.log('release');

                    this.release(this.currentMouseCoordinates.x, this.currentMouseCoordinates.y);
                }
            );
    }

    /**
     * Starts dragging this.item
     */
    protected initializeDrag(): void {
        // Send out start event
        this.emitter.next({
            channel: 'drag',
            /** {@link DragsterDragEventHandlerSignature} */
            data: [this.item, this.originalContainer]
        });

        // Get offset coordinates for this.item
        let rect = this.item.getBoundingClientRect();
        this.itemOriginalCoordinates = {
            x: rect.left + window.pageXOffset,
            y: rect.top + window.pageYOffset
        };

        // todo add hook for local item
        this.item.setAttribute('data-dragster-transit', '');

        this.flyingItem = this.options.flyingElementProvider(this.elementToFly());

        // Append to target mirror conatiner
        this.options.mirrorContainer.appendChild(this.flyingItem);

        // Add data-dragster-flying to flying element
        // this.flyingItem.setAttribute('data-dragster-flying', '');

        // Send out cloned event
        this.emitClonedEvent();

        this.dragging = true;
    }

    /**
     * Emits a cloned event for the recently created flyingElement. Intendet to be overwritten by sub classes.
     */
    protected emitClonedEvent(): void {
        this.emitter.next({
            channel: 'cloned',
            /** {@link DragsterClonedEventHandlerSignature} */
            data: [this.flyingItem, this.item, 'mirror']
        });
    }

    /**
     * Detects drop zones below this.flyingItem
     * @param mouseX
     * @param mouseY
     */
    protected detectDropZone(mouseX: number, mouseY: number): void {
        // Cancel if there is no flyingItem
        if (this.flyingItem == null) return;

        let overElement = getElementBehindPoint(mouseX, mouseY, this.flyingItem);
        let dropZoneContainer = this.findDropTarget(overElement, mouseX, mouseY);
        let dropZone: IDragonDropZone | null = null;

        // Find default drop zone configuration (for dropZone)
        if (dropZoneContainer != null) {
            dropZone = this.detectCurrentDropZonePosition(dropZoneContainer, overElement, mouseX, mouseY);
        }

        // Fallback to revertable drop zone if revertOnSpill flag is given
        if (dropZone == null) dropZone = this.detectRevertableDropZone();

        // Determine whether the drop target did change
        let dropTargetDidChange = (dropZone != null && dropZone.container !== this.lastDropTarget);

        // Re-assign lastDropZone and trigger events
        if (dropTargetDidChange || dropZone == null) {
            this.changeLastDropZone(dropZone);
        }

        // Move shadow element
        this.moveShadow(dropZone, dropTargetDidChange);
    }

    protected changeLastDropZone(dropZone: IDragonDropZone | null): void {
        // Emit out event
        if (this.lastDropTarget != null) {
            this.emitter.next({
                channel: 'out',
                /** {@link DragsterOutEventHandlerSignature} */
                data: [this.item, this.lastDropTarget, this.originalContainer]
            });
        }

        this.lastDropTarget = dropZone == null ? null : dropZone.container;

        // Emit over event
        if (this.lastDropTarget != null) {
            this.emitter.next({
                channel: 'over',
                /** {@link DragsterOverEventHandlerSignature} */
                data: [this.item, this.lastDropTarget, this.originalContainer]
            });
        }
    }

    protected moveShadow(dropZone: IDragonDropZone | null, dropTargetDidChange: boolean): void {
        // Cancel if dropZone is null
        if (dropZone == null) {
            if (this.shadowItem != null) {
                this.shadowItem.parentNode.removeChild(this.shadowItem);
                this.shadowItem = null;
            }
            return;
        }

        // Check conditions for adding shadow to dropZone
        let dropZoneDidChangeAndHasNoSibling = (dropZone.nextSibling == null && dropTargetDidChange);
        let dropZoneSiblingIsNotShadow = (dropZone.nextSibling !== this.shadowItem);
        let dropZoneShadowIsNotAlreadyAtPosition: boolean;
        if (this.shadowItem == null) {
            dropZoneShadowIsNotAlreadyAtPosition = (dropZone.nextSibling != null);
        }
        else {
            dropZoneShadowIsNotAlreadyAtPosition = (dropZone.nextSibling !== getNextSibling(this.shadowItem));
        }

        if (dropZoneDidChangeAndHasNoSibling || (dropZoneSiblingIsNotShadow && dropZoneShadowIsNotAlreadyAtPosition)) {
            this.currentSibling = dropZone.nextSibling;

            // Remove existing shadow item if present
            // Do not remove it if it is the original item
            if (this.shadowItem != null && this.shadowItem !== this.item) {
                this.shadowItem.parentNode.removeChild(this.shadowItem);
                this.shadowItem = null;
            }

            // Create new shadowItem
            this.shadowItem = this.options.shadowElementProvider(this.item, dropZone.container);

            // Insert shadowItem
            dropZone.container.insertBefore(this.shadowItem, dropZone.nextSibling);

            // Emit shadow event
            this.emitter.next({
                channel: 'shadow',
                /** {@link DragsterShadowEventHandlerSignature} */
                data: [this.shadowItem, dropZone.container, this.originalContainer]
            });
        }
    }

    /**
     * Detects the drop zone at the current position. Returns null if no drop zone is assignable.
     * @param detectedDropZone
     * @param elementWithin
     * @param mouseX
     * @param mouseY
     * @returns {IDragonDropZone}
     */
    protected detectCurrentDropZonePosition(detectedDropZone: HTMLElement, elementWithin: HTMLElement, mouseX: number, mouseY: number): IDragonDropZone | null {
        if (detectedDropZone == null) return null;
        if (this.options.direction == null) return null;

        // Find child in Drop Zone
        let immediate = getImmediateChild(detectedDropZone, elementWithin);

        if (immediate != null) {
            // If there is a child right below the element dragged, find position to add
            let reference = getElementForPosition(detectedDropZone, immediate, mouseX, mouseY, this.options.direction);

            // Return dropZone
            return {container: detectedDropZone, nextSibling: reference};
        }
        else {
            // If there is no child right below the element dragged, add at the end of the container
            return {container: detectedDropZone, nextSibling: null};
        }
    }

    /**
     * Returns the revertable drop zoen if revertOnSpill is active.
     * @returns {IDragonDropZone}
     */
    protected detectRevertableDropZone(): IDragonDropZone | null {
        if (!this.options.revertOnSpill) return null;

        return {container: this.originalContainer, nextSibling: this.originalSibling};
    }

    /**
     * Releases this.item currently being dragged at position mouseX|mouseY
     * @param mouseX
     * @param mouseY
     */
    protected release(mouseX: number, mouseY: number): void {
        // Cancel if not dragging
        if (!this.isDragging()) {
            // Emit cancelBeforeDragging event to inform Dragster
            this.emitter.next({channel: 'cancelBeforeDragging', data: []});
            return;
        }

        // Cancel if there is no flyingElement
        if (this.flyingItem == null) return;

        // Detect drop zone
        let overElement = getElementBehindPoint(mouseX, mouseY, this.flyingItem);
        let dropZone = this.findDropTarget(overElement, mouseX, mouseY);

        if (dropZone != null) {
            this.drop(this.item, dropZone);
        }
        else if (this.options.removeOnSpill) {
            this.remove();
        }
        else {
            this.cancel();
        }

        // Set instance variables
        // Cancel drag events
        this.dragging = false;
        this.cancelled = true;

        // Unsubscribe stream
        this.itemMoveStream.unsubscribe();
    }

    /**
     * Performs a drop operation of item into target
     * @param item
     * @param target
     */
    protected drop(item: HTMLElement, target: HTMLElement): void {
        // Cancel if not dragging
        if (!this.isDragging()) return;

        // If dropped at initial position, emit cancel event instead of drop event
        if (this.isInInitialPlacement(target, this.currentSibling)) {
            this.emitter.next({
                channel: 'cancel',
                /** {@link DragsterCancelEventHandlerSignature} */
                data: [item, target, this.originalContainer]
            });
        }
        else {
            // Emit drop event
            this.emitter.next({
                channel: 'drop',
                /** {@link DragsterDropEventHandlerSignature} */
                data: [item, target, this.originalContainer, this.currentSibling]
            });
        }

        this.cleanup();
    }

    public remove(): void {
        // Cancel if not dragging
        if (!this.isDragging()) return;

        // Remove this.item
        let parent = <HTMLElement>this.item.parentNode;
        if (parent != null) parent.removeChild(this.item);

        // Emit remove event
        this.emitter.next({
            channel: 'remove',
            /** {@link DragsterRemoveEventHandlerSignature} */
            data: [this.item, parent, this.originalContainer]
        });

        this.cleanup();
    }

    /**
     * Cancels the current drag operation. If configured or revert is set, this.item will be reverted to its original position.
     * @param revert
     */
    public cancel(revert: boolean = false): void {
        // Cancel if not dragging
        if (!this.isDragging()) return;

        let reverts = this.options.revertOnSpill;
        if (revert) reverts = true;

        // If cancelled before having detected the first drop target, the original container is treated as the last drop target
        let lastDropTarget = this.lastDropTarget || this.originalContainer;

        let isInInitialPosition = this.isInInitialPlacement(lastDropTarget, this.currentSibling);
        if (!isInInitialPosition && reverts) {
            this.originalContainer.insertBefore(this.item, this.originalSibling);
        }

        if (isInInitialPosition || reverts) {
            // Emit cancel event
            this.emitter.next({
                channel: 'cancel',
                /** {@link DragsterCancelEventHandlerSignature} */
                data: [this.item, this.originalContainer, this.originalContainer]
            });
        }
        else {
            // Emit drop event
            this.emitter.next({
                channel: 'drop',
                /** {@link DragsterDropEventHandlerSignature} */
                data: [this.item, lastDropTarget, this.originalContainer, this.currentSibling]
            });
        }

        this.cleanup();
    }

    /**
     * Performs a cleanup of this, removing the flying element.
     */
    protected cleanup(): void {
        // Emit dragend event
        this.emitter.next({
            channel: 'dragend',
            /** {@link DragsterDragEndEventHandlerSignature} */
            data: [this.item]
        });

        // Remove data-dragster-transit attribute todo: add hook
        this.item.removeAttribute('data-dragster-transit');

        // Cancel if there is no flyingElement
        if (this.flyingItem != null) {
            // Remove flyingItem
            this.flyingItem.parentNode.removeChild(this.flyingItem);

            // Emit out event for lastDropTarget
            if (this.lastDropTarget != null) {
                this.emitter.next({
                    channel: 'out',
                    /** {@link DragsterOutEventHandlerSignature} */
                    data: [this.item, this.lastDropTarget, this.originalContainer]
                });
            }
        }

        // Complete event stream
        this.emitter.complete();
    }

    /**
     * Finds a drop target below elementFlownOver at cursor position mouseX|mouseY
     * @param elementFlownOver
     * @param mouseX
     * @param mouseY
     * @returns {HTMLElement}
     */
    protected findDropTarget(elementFlownOver: HTMLElement, mouseX: number, mouseY: number): HTMLElement | null {
        let target: HTMLElement | null = elementFlownOver;

        do {
            // Skip if the given element is not a valid container element
            if (!this.isContainer(target)) {
                target = getParentElement(target);
                continue;
            }

            // Detect immediate child element of target, cancel if it does not exist
            let immediate = getImmediateChild(target, elementFlownOver);

            if (immediate == null) {
                // There is no child container right below the element dragged ~> add as last element
                // An element should always be allowed to drop back to its origin
                if (this.isInInitialPlacement(target, null)) break;

                // Use options to detect if able to drop
                if (this.options.accepts(this.item, target, this.originalContainer, null)) break;
                else return null;
            }
            else {
                // Child element below has been found
                let elementAtPosition = getElementForPosition(target, immediate, mouseX, mouseY, this.options.direction);

                // An element should always be allowed to drop back to its origin
                if (this.isInInitialPlacement(target, elementAtPosition)) break;

                // Use options to detect if able to drop
                if (this.options.accepts(this.item, target, this.originalContainer, elementAtPosition)) break;
                else return null;
            }
        } while (target != null);

        return target;
    }

    /**
     * Returns true if the given item is a container of this
     * {@link Dragster#isContainer}
     * @param item
     */
    protected isContainer(item: HTMLElement): boolean {
        return this.dragster.isContainer(item);
    }

    /**
     * Returns the item that will be passed over to the flying element provider
     * Intended to be overwritten by subclasses
     * @returns {HTMLElement}
     */
    protected elementToFly(): HTMLElement {
        return this.item;
    }

    // Index Signature for DragonElement
    // tslint:disable-next-line
    [key: string]: any;
}
