import {IDragsterOptions} from "./interfaces/dragster-options";

export var DragsterDefaultOptions: IDragsterOptions = {
    moves(triggeringElement?: HTMLElement, sourceContainer?: HTMLElement, dragHandle?: HTMLElement, sibling?: HTMLElement): boolean {
        // All elements are draggable by default
        return true;
    },
    accepts(triggeringElement?: HTMLElement, sourceContainer?: HTMLElement, targetContainer?: HTMLElement, sibling?: HTMLElement): boolean {
        // All elements can be dropped by default
        return true;
    },
    invalid(triggeringElement?: HTMLElement, handle?: HTMLElement): boolean {
        // No element is prohibited from being dragged by default
        return false;
    },
    isContainer(container?: HTMLElement): boolean {
        // No other container beside the default specified containers is a valid container
        return false;
    },
    // No element will be cloned by default
    copy: false,

    // No sorting of source containers
    copySortSource: false,

    // Follow shadow for spilling behavior
    revertOnSpill: false,
    removeOnSpill: false,

    // By default, the Y axis is considered
    direction: "vertical",

    // By default, mirrored images are applied to body
    mirrorContainer: document.body,

    // By default, text selection is disallowed
    ignoreInputTextSelection: true,
};