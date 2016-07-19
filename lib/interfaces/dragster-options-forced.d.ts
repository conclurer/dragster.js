import {IDragsterOptions, DrakeDirection, DrakeCloneConfigurator} from './dragster-options';

/** See {@link IDragsterOptions} */
export interface IDragsterOptionsForced extends IDragsterOptions {
    moves(triggeringElement?: HTMLElement, sourceContainer?: HTMLElement, dragHandle?: HTMLElement, sibling?: HTMLElement | null): boolean;
    accepts(triggeringElement?: HTMLElement, targetContainer?: HTMLElement, sourceContainer?: HTMLElement, sibling?: HTMLElement | null): boolean;
    invalid(triggeringElement?: HTMLElement, handle?: HTMLElement): boolean;
    isContainer(container?: HTMLElement): boolean;
    flyingElementProvider(originalElement?: HTMLElement): HTMLElement;
    copy: (DrakeCloneConfigurator|boolean);
    copySortSource: boolean;
    revertOnSpill: boolean;
    removeOnSpill: boolean;
    direction: DrakeDirection;
    mirrorContainer: HTMLElement;
    ignoreInputTextSelection: boolean;
}
