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

    // Item used for copying
    public copy: HTMLElement;

    public renderTimer: any; // #todo

    // Last element, this.item was over
    public lastDropTarget: HTMLElement;

    public grabbed: any; // #todo


}