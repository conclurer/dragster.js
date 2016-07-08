export interface IDragsterStartContext {
    item: HTMLElement;
    source: HTMLElement;
}

export interface IDragsterEvent {
    channel: string;
    data: any[];
}

// Clone Event
export type DragsterCloneType = 'copy' | 'mirror';
export type DragsterClonedEventHandler = (clonedElement?: HTMLElement, originalElement?: HTMLElement, cloneType?: DragsterCloneType)=>any;

// Drag Event
export type DragsterDragEventHandler = (draggedElement?: HTMLElement, sourceContainer?: HTMLElement)=>any;