export interface IDragsterStartContext {
    item: HTMLElement;
    source: HTMLElement;
}

export interface IDragsterEvent {
    channel: string;
    // Any as type for response data (mixed array)
    // tslint:disable-next-line
    data: any[];
}

export interface IMouseEventMapping {
    mouseup: string;
    mousedown: string;
    mousemove: string;
    [key: string]: string;
}

export interface IDragonItemCoordinates {
    x: number;
    y: number;
}

export interface IDragonDropZone {
    container: HTMLElement;
    nextSibling: HTMLElement | null;
}

export type dropTargetLocator = (elementFlownOver: HTMLElement, mouseX: number, mouseY: number) => HTMLElement | null;
export type shadowElementProvider = (elementInMotion: HTMLElement, shadowContainer: HTMLElement) => HTMLElement;

export type mouseEventName = 'mouseup' | 'mousedown' | 'mousemove';

// Clone Event
export type DragsterCloneType = 'copy' | 'mirror';
export type DragsterClonedEventHandler = (clonedElement?: HTMLElement,
                                          originalElement?: HTMLElement,
                                          cloneType?: DragsterCloneType) => void;

// Drag Event
export type DragsterDragEventHandler = (draggedElement?: HTMLElement,
                                        sourceContainer?: HTMLElement) => void;

// Dragend Event
export type DragsterDragEndEventHandler = (draggedElement?: HTMLElement) => void;

// Cancel Event
export type DragsterCancelEventHandler = (draggedElement?: HTMLElement,
                                          currentContainer?: HTMLElement,
                                          sourceContainer?: HTMLElement) => void;

// Drop Event
export type DragsterDropEventHandler = (droppedElement?: HTMLElement,
                                        dropTargetContainer?: HTMLElement,
                                        sourceContainer?: HTMLElement,
                                        beforeSibling?: HTMLElement) => void;

// Out Event
export type DragsterOutEventHandler = (movedElement?: HTMLElement,
                                       containerElementWasOver?: HTMLElement,
                                       sourceContainer?: HTMLElement) => void;

// Over Event
export type DragsterOverEventHandler = (movedElement?: HTMLElement,
                                        containerElementIsOver?: HTMLElement,
                                        sourceContainer?: HTMLElement) => void;

// Shadow Event
export type DragsterShadowEventHandler = (shadowElement?: HTMLElement,
                                          containerShadowIsIn?: HTMLElement,
                                          sourceContainer?: HTMLElement) => void;

// Remove Event
export type DragsterRemoveEventHandler = (removedElement?: HTMLElement,
                                          lastContainer?: HTMLElement,
                                          sourceContainer?: HTMLElement) => void;