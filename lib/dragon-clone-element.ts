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
        let target: HTMLElement | null = super.findDropTarget(elementFlownOver, mouseX, mouseY);

        // DropTarget must not be source container
        return (target === this.originalContainer) ? null : target;
    }
}
