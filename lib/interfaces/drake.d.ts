import {
    DragsterDragEndEventHandlerSignature,
    DragsterDragEventHandlerSignature,
    DragsterClonedEventHandlerSignature,
    DragsterCancelEventHandlerSignature,
    DragsterDropEventHandlerSignature,
    DragsterOutEventHandlerSignature,
    DragsterOverEventHandlerSignature,
    DragsterShadowEventHandlerSignature,
    DragsterRemoveEventHandlerSignature
} from './dragster-results';

// Source:
// Type definitions for dragula v2.1.2
// Project: http://bevacqua.github.io/dragula/
// Definitions by: Paul Welter <https://github.com/pwelter34/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

export interface IDrake {
    containers: Element[];
    dragging: boolean;
    start(item: Element): void;
    end(): void;
    cancel(revert?: boolean): void;
    remove(): void;
    on(events: 'drag', callback: DragsterDragEventHandlerSignature): IDrake;
    on(events: 'dragend', callback: DragsterDragEndEventHandlerSignature): IDrake;
    on(events: 'cloned', callback: DragsterClonedEventHandlerSignature): IDrake;
    on(events: 'cancel', callback: DragsterCancelEventHandlerSignature): IDrake;
    on(events: 'drop', callback: DragsterDropEventHandlerSignature): IDrake;
    on(events: 'out', callback: DragsterOutEventHandlerSignature): IDrake;
    on(events: 'over', callback: DragsterOverEventHandlerSignature): IDrake;
    on(events: 'shadow', callback: DragsterShadowEventHandlerSignature): IDrake;
    on(events: 'remove', callback: DragsterRemoveEventHandlerSignature): IDrake;
    on(events: string, callback: Function): IDrake;
    destroy(): void;
}
