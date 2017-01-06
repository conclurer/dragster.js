import {DragonElement} from '../../lib/dragon-element';
import {IDragonDropZone} from '../../lib/interfaces/dragster-results';

export class MockDragonElement extends DragonElement {
    protected setupStream(): void {
        this.initializeDrag();
        this.mockDetectDropZone(this.originalContainer, this.originalSibling);
    }

    public mockMove(element: HTMLElement, sibling: HTMLElement | null = null): void {
        this.mockDetectDropZone(element, sibling);
    }

    public forceRelease(): void {
        // overwrite: this.release
        // Cancel if not dragging
        if (!this.isDragging()) {
            // Emit cancelBeforeDragging event to inform Dragster
            this.emitter.next({channel: 'cancelBeforeDragging', data: []});
            return;
        }

        // Cancel if there is no flyingElement
        if (this.flyingItem == null) return;

        // Detect drop zone (mocked to this.latestDropTarget)
        let dropZone = this.lastDropTarget;

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
    }

    protected mockDetectDropZone(element: HTMLElement, sibling: HTMLElement | null): void {
        let dropZone = MockDragonElement.mockDetectCurrentDropZonePosition(element, sibling);
        let dropTargetDidChange = (dropZone != null && dropZone.container !== this.lastDropTarget);

        // Re-assign lastDropZone and trigger events
        if (dropTargetDidChange || dropZone == null) {
            this.changeLastDropZone(dropZone);
        }

        // Move shadow
        this.moveShadow(dropZone, dropTargetDidChange);
    }

    protected static mockDetectCurrentDropZonePosition(detectedDropZone: HTMLElement, sibling: HTMLElement | null): IDragonDropZone {
        return {container: detectedDropZone, nextSibling: sibling};
    }
}
