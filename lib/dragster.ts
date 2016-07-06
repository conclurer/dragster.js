export class Dragster {

    // Instance variables
    // Mirrored HTML Element
    protected mirror: HTMLElement;

    // Source Container
    protected source: HTMLElement;

    // Item being dragged
    protected item: HTMLElement;

    // Offset coordinates
    protected offsetX: any; // #todo
    protected offsetY: any; // #todo

    // Move coordinates
    protected moveX: any; // #todo
    protected moveY: any; // #todo

    protected initialSibling: any; // #todo
    protected currentSibling: any; // #todo

    // Item used for copying
    protected copy: HTMLElement;

    protected renderTimer: any; // #todo

    // Last element, this.item was over
    protected lastDropTarget: HTMLElement;

    protected grabbed: any; // #todo
}