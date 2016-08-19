import {DragonElement} from '../../lib/dragon-element';
import {IDragonDropZone} from '../../lib/interfaces/dragster-results';
import {getNextSibling} from '../../lib/helpers/node-functions';

export class MockDragonElement extends DragonElement {
    protected setupStream(): void {
        this.initializeDrag();
        this.mockDetectDropZone(this.originalContainer, this.originalSibling);
    }

    public mockMove(element: HTMLElement, sibling: HTMLElement | null = null): void {
        this.mockDetectDropZone(element, sibling);
    }

    protected mockDetectDropZone(element: HTMLElement, sibling: HTMLElement | null): void {
        let dropZone: IDragonDropZone = MockDragonElement.mockDetectCurrentDropZonePosition(element, sibling);
        let dropTargetDidChange: boolean = (dropZone != null && dropZone.container !== this.lastDropTarget);

        // Re-assign lastDropZone and trigger events
        if (dropTargetDidChange || dropZone == null) {
            // Emit out event
            if (this.lastDropTarget != null) {
                this.emitter.next({
                    channel: 'out',
                    /** {@link DragsterOutEventHandler} */
                    data: [this.item, this.lastDropTarget, this.originalContainer]
                });
            }

            this.lastDropTarget = dropZone == null ? null : dropZone.container;

            // Emit over event
            if (this.lastDropTarget != null) {
                this.emitter.next({
                    channel: 'over',
                    /** {@link DragsterOverEventHandler} */
                    data: [this.item, this.lastDropTarget, this.originalContainer]
                });
            }
        }

        // Cancel if dropZone is null
        if (dropZone == null) {
            if (this.shadowItem != null) {
                this.shadowItem.parentNode.removeChild(this.shadowItem);
                this.shadowItem = null;
            }
            return;
        }

        // Check conditions for adding shadow to dropZone
        let dropZoneDidChangeAndHasNoSibling: boolean = (dropZone.nextSibling == null && dropTargetDidChange);
        let dropZoneSiblingIsNotShadow: boolean = (dropZone.nextSibling !== this.shadowItem);
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
                /** {@link DragsterShadowEventHandler} */
                data: [this.shadowItem, dropZone.container, this.originalContainer]
            });
        }
    }

    protected static mockDetectCurrentDropZonePosition(detectedDropZone: HTMLElement, sibling: HTMLElement | null): IDragonDropZone {
        return {container: detectedDropZone, nextSibling: sibling};
    }
}
