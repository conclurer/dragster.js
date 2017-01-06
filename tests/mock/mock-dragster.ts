import {Dragster} from '../../lib/dragster';
import {MockDragonElement} from './mock-dragon-element';
import {IDragsterEvent, IDragsterStartContext} from '../../lib/interfaces/dragster-results';
import {getNextSibling} from '../../lib/helpers/node-functions';
import {IDragsterOptionsForced} from '../../lib/interfaces/dragster-options-forced';

export class MockDragster extends Dragster {
    public draggedElement: MockDragonElement | null;
    public options: IDragsterOptionsForced;

    protected triggerStart(context: IDragsterStartContext): void {
        // Configure Dragon
        // Check if copy is required (will create clone)
        if (this.requiresCopy(context.item, context.source)) {
            // todo: this.draggedElement = new DragonCloneElement(context.item, this.options, this);
            this.draggedElement = new MockDragonElement(context.item, this.options, this);
        }
        else {
            this.draggedElement = new MockDragonElement(context.item, this.options, this);
        }

        this.draggedElement.setOrigin(context.source, getNextSibling(context.item));

        // Subscribe to Dragon events
        this.draggedElementEventSubscription = this.draggedElement.events$.subscribe((dragsterEvent: IDragsterEvent) => {
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
                    /** {@link DragsterDragEndEventHandlerSignature} */
                    this.emitter.next({channel: dragsterEvent.channel, data: dragsterEvent.data});

                    // Cleanup this
                    this.cleanup();
                    break;
            }
        });
    }

}
