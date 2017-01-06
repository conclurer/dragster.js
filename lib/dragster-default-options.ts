import {
    drakeDirection,
    DragsterFlyingElementProviderSignature,
    DragsterShadowElementProviderSignature
} from './interfaces/dragster-options';
import {IDragsterOptionsForced} from './interfaces/dragster-options-forced';
import {dragsterDefaultFlyingElementProvider} from './helpers/flying-element-provider';
import {dragsterDefaultShadowElementProvider} from './helpers/shadow-element-provider';

export class DragsterDefaultOptions implements IDragsterOptionsForced {

    public moves(triggeringElement?: HTMLElement, sourceContainer?: HTMLElement, dragHandle?: HTMLElement, sibling?: HTMLElement): boolean {
        // All elements are draggable by default
        return true;
    }

    public accepts(triggeringElement?: HTMLElement, sourceContainer?: HTMLElement, targetContainer?: HTMLElement, sibling?: HTMLElement): boolean {
        // All elements can be dropped by default
        return true;
    }

    public invalid(triggeringElement?: HTMLElement, handle?: HTMLElement): boolean {
        // No element is prohibited from being dragged by default
        return false;
    }

    public isContainer(container?: HTMLElement): boolean {
        // No other container beside the default specified containers is a valid container
        return false;
    }

    public flyingElementProvider: DragsterFlyingElementProviderSignature = dragsterDefaultFlyingElementProvider;

    public shadowElementProvider: DragsterShadowElementProviderSignature = dragsterDefaultShadowElementProvider;

    // No element will be cloned by default
    public copy: boolean = false;

    // No sorting of source containers
    public copySortSource: boolean = false;

    // Follow shadow for spilling behavior
    public revertOnSpill: boolean = false;
    public removeOnSpill: boolean = false;

    // By default, the Y axis is considered
    public direction: drakeDirection = 'vertical';

    // By default, mirrored images are applied to body
    public mirrorContainer: HTMLElement = document.body;

    // By default, text selection is disallowed
    public ignoreInputTextSelection: boolean = true;

    // By default no container is added
    public containers: HTMLElement[] = [];

    // Index signature
    [key: string]: boolean | HTMLElement | HTMLElement[] | string | undefined | Function;
}
