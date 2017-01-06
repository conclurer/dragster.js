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

export interface ShadowElementProviderSignature {
    (elementInMotion: HTMLElement, shadowContainer: HTMLElement): HTMLElement;
}

export type mouseEventName = 'mouseup' | 'mousedown' | 'mousemove';

// Clone Event
export type dragsterCloneType = 'copy' | 'mirror';
export interface DragsterClonedEventHandlerSignature {
    (clonedElement: HTMLElement, originalElement: HTMLElement, cloneType: dragsterCloneType): void;
}

// Drag Event
export interface DragsterDragEventHandlerSignature {
    (draggedElement: HTMLElement, sourceContainer: HTMLElement): void;
}

// Dragend Event
export interface DragsterDragEndEventHandlerSignature {
    (draggedElement: HTMLElement): void;
}

// Cancel Event
export interface DragsterCancelEventHandlerSignature {
    (draggedElement: HTMLElement, currentContainer: HTMLElement, sourceContainer: HTMLElement): void;
}

// Drop Event
export interface DragsterDropEventHandlerSignature {
    (droppedElement: HTMLElement, dropTargetContainer: HTMLElement, sourceContainer: HTMLElement, beforeSibling: HTMLElement): void;
}

// Out Event
export interface DragsterOutEventHandlerSignature {
    (movedElement: HTMLElement, containerElementWasOver: HTMLElement, sourceContainer: HTMLElement): void;
}

// Over Event
export interface DragsterOverEventHandlerSignature {
    (movedElement: HTMLElement, containerElementIsOver: HTMLElement, sourceContainer: HTMLElement): void;
}

// Shadow Event
export interface DragsterShadowEventHandlerSignature {
    (shadowElement: HTMLElement, containerShadowIsIn: HTMLElement, sourceContainer: HTMLElement): void;
}

// Remove Event
export interface DragsterRemoveEventHandlerSignature {
    (removedElement: HTMLElement, lastContainer: HTMLElement, sourceContainer: HTMLElement): void;
}
