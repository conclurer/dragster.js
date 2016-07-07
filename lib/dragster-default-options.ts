import {IDragsterOptions} from "./interfaces/dragster-options";

export class DragsterDefaultOptions implements IDragsterOptions {
    public moves(triggeringElement?: HTMLElement, sourceContainer?: HTMLElement, dragHandle?: HTMLElement, sibling?: HTMLElement): boolean {
        // All elements are draggable by default
        return true;
    }
}