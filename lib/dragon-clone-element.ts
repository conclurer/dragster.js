import {DragonElement} from './dragon-element';
import {Dragster} from './dragster';
import {IDragsterOptionsForced} from './interfaces/dragster-options-forced';

export class DragonCloneElement extends DragonElement {
    // Original HTML Element
    protected originalItem: HTMLElement;

    public constructor(item: HTMLElement, options: IDragsterOptionsForced, dragster: Dragster) {
        super(<HTMLElement>item.cloneNode(true), options, dragster);

        // Save original HTMLElement
        this.originalItem = item;
    }

    protected elementToFly(): HTMLElement {
        return this.originalItem;
    }

    protected findDropTarget(elementFlownOver: HTMLElement, mouseX: number, mouseY: number): HTMLElement | null {
        let target = super.findDropTarget(elementFlownOver, mouseX, mouseY);

        // DropTarget must not be source container
        return (target === this.originalContainer) ? null : target;
    }

    protected emitClonedEvent(): void {
        this.emitter.next({
            channel: 'cloned',
            /** {@link DragsterClonedEventHandlerSignature} */
            data: [this.flyingItem, this.originalItem, 'copy']
        });
    }

    public remove(): void {
        // Cancel if not dragging
        if (!this.isDragging()) return;

        // Emit cancel event
        this.emitter.next({
            channel: 'cancel',
            /** {@link DragsterCancelEventHandlerSignature} */
            data: [this.item, null, this.originalContainer]
        });

        // Perform cleanup
        this.cleanup();
    }

    public cancel(revert: boolean = false): void {
        // Cancel if not dragging
        if (!this.isDragging()) return;

        // Cancelling a DragonCloneElement will always result in a cancel event
        this.emitter.next({
            channel: 'cancel',
            /** {@link DragsterCancelEventHandlerSignature} */
            data: [this.item, this.originalContainer, this.originalContainer]
        });

        this.cleanup();
    }
}
