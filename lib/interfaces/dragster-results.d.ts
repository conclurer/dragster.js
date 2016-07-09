export interface IDragsterStartContext {
    item: HTMLElement;
    source: HTMLElement;
}

export interface IDragsterEvent {
    channel: string;
    data: any[];
}

export interface MouseEventMapping {
    mouseup: string;
    mousedown: string;
    mousemove: string;
    [key: string]: string;
}

export interface IDragonItemCoordinates {
    x: number,
    y:number;
}

export type dropTargetLocator = (elementFlownOver: HTMLElement, mouseX: number, mouseY: number)=>HTMLElement;
export type shadowElementProvider = (elementInMotion: HTMLElement, shadowContainer: HTMLElement)=> HTMLElement;

export type mouseEventName = 'mouseup' | 'mousedown' | 'mousemove';

// Clone Event
export type DragsterCloneType = 'copy' | 'mirror';
export type DragsterClonedEventHandler = (clonedElement?: HTMLElement,
                                          originalElement?: HTMLElement,
                                          cloneType?: DragsterCloneType)=>any;

// Drag Event
export type DragsterDragEventHandler = (draggedElement?: HTMLElement,
                                        sourceContainer?: HTMLElement)=>any;

// Cancel Event
export type DragsterCancelEventHandler = (draggedElement?: HTMLElement,
                                          currentContainer?: HTMLElement,
                                          sourceContainer?: HTMLElement)=>any;

// Drop Event
export type DragsterDropEventHandler = (droppedElement?: HTMLElement,
                                        dropTargetContainer?: HTMLElement,
                                        sourceContainer?: HTMLElement,
                                        beforeSibling?: HTMLElement)=>any;