import {
    IDragsterOptions,
    drakeDirection,
    DrakeCloneConfiguratorSignature,
    DragsterFlyingElementProviderSignature,
    DragsterShadowElementProviderSignature
} from './dragster-options';

/** See {@link IDragsterOptions} */
export interface IDragsterOptionsForced extends IDragsterOptions {
    containers: HTMLElement[];
    moves(triggeringElement?: HTMLElement, sourceContainer?: HTMLElement, dragHandle?: HTMLElement, sibling?: HTMLElement | null): boolean;
    accepts(triggeringElement?: HTMLElement, targetContainer?: HTMLElement, sourceContainer?: HTMLElement, sibling?: HTMLElement | null): boolean;
    invalid(triggeringElement?: HTMLElement, handle?: HTMLElement): boolean;
    isContainer(container?: HTMLElement): boolean;
    flyingElementProvider: DragsterFlyingElementProviderSignature;
    shadowElementProvider: DragsterShadowElementProviderSignature;
    copy: (DrakeCloneConfiguratorSignature|boolean);
    copySortSource: boolean;
    revertOnSpill: boolean;
    removeOnSpill: boolean;
    direction: drakeDirection;
    mirrorContainer: HTMLElement;
    ignoreInputTextSelection: boolean;
}
