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
    cancel(): void;
    remove(): void;
    on(events: string, callback: Function): void;
    destroy(): void;
}