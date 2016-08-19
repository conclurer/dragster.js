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

    protected mockDetectDropZone(element: HTMLElement, sibling: HTMLElement | null): void {
        let dropZone: IDragonDropZone = MockDragonElement.mockDetectCurrentDropZonePosition(element, sibling);
        let dropTargetDidChange: boolean = (dropZone != null && dropZone.container !== this.lastDropTarget);

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
