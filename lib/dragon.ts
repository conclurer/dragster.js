import {Subscription} from "rxjs/Subscription";

/**
 * Dragon
 * Dragster's dragon'drop handler
 */
export class Dragon {

    // Instance variables
    // Mirrored HTML Element
    public mirror: HTMLElement;

    // Source Container
    public source: HTMLElement;

    // Item being dragged
    public item: HTMLElement;

    // Offset coordinates
    public offsetX: any; // #todo
    public offsetY: any; // #todo

    // Move coordinates
    public moveX: any; // #todo
    public moveY: any; // #todo

    public initialSibling: any; // #todo
    public currentSibling: any; // #todo

    // Cloned item
    public copy: HTMLElement;

    public renderTimer: any; // #todo

    // Last element, this.item was over
    public lastDropTarget: HTMLElement;

    // Dragging status
    public dragging: boolean = false;

    // Mousedown context
    public grabbed: boolean = false;

    // User actions subscriptions for current drag context
    protected currentDragContextUserActions: Subscription[] = [];

    /**
     * Returns the item currently being dragged.
     * If both a copy and the original item is given, the copied item will be returned
     * @returns {HTMLElement}
     */
    public get draggedItem(): HTMLElement {
        return this.copy || this.item;
    }

    /**
     * Returns true if a copied item is given
     * @returns {boolean}
     */
    public hasCopy(): boolean {
        return this.copy != null;
    }

    /**
     * Returns true if there is currently a mirror element given
     * @returns {boolean}
     */
    public hasMirror(): boolean {
        return this.mirror != null;
    }

    public hasLastDropTarget(): boolean {
        return this.lastDropTarget != null;
    }

    public clean(): void {
        let draggedItem = this.draggedItem;
        this.ungrab();
        this.removeMirror();

        // todo remove transit CSS class from dropped element
        // todo renderTimer

        this.dragging = false;

        if (this.hasLastDropTarget()) {
            // todo: trigger "out" event for last drop target
        }

        // todo: emit dragend event
        // todo: clear instance variables
    }

    public ungrab(): void {
        this.grabbed = false;

        // Unsubscribe all actions
        for (let action of this.currentDragContextUserActions) {
            if (!action.isUnsubscribed) action.unsubscribe();
        }

        // Unbind all actions
        this.currentDragContextUserActions = [];
    }

    protected removeMirror(): void {
        if (this.hasMirror()) {
            // todo remove mirror object (removeMirrorImage())
        }
    }
}