export interface IDragsterOptions {

    /**
     * All containers allowed for drag and drop operations
     */
    containers?: HTMLElement[];

    /**
     * Returns the state whether or not triggeringElement can be dragged.
     * @param triggeringElement
     * @param sourceContainer
     * @param dragHandle
     * @param sibling
     */
    moves?(triggeringElement?: HTMLElement, sourceContainer?: HTMLElement, dragHandle?: HTMLElement, sibling?: HTMLElement | null): boolean;

    /**
     * If true, triggeringElement from sourceContainer can be moved into targetContainer
     * @param triggeringElement
     * @param targetContainer
     * @param sourceContainer
     * @param sibling
     */
    accepts?(triggeringElement?: HTMLElement, targetContainer?: HTMLElement, sourceContainer?: HTMLElement, sibling?: HTMLElement | null): boolean;

    /**
     * If true, triggeringElement cannot be dragged
     * @param triggeringElement
     * @param handle
     */
    invalid?(triggeringElement?: HTMLElement, handle?: HTMLElement): boolean;

    /**
     * If true, container is a valid container besides otherwise specified containers
     * (See {@link Dragster})
     * @param container
     */
    isContainer?(container?: HTMLElement): boolean;

    /**
     * The item returned is the flying element dragged while the user presses down their mouse button
     * @param originalElement
     */
    flyingElementProvider?: DragsterFlyingElementProvider;

    /**
     * The item returned is the item that will be added at the position the user will drop the element currently dragged
     * @param itemInMotion
     * @param shadowContainer
     */
    shadowElementProvider?: DragsterShadowElementProvider;

    transitElementName?: string;

    /**
     * If true or returning true, the element dragged will be cloned on drop.
     * (See {@link DrakeCloneConfigurator})
     */
    copy?: (DrakeCloneConfigurator|boolean);

    /**
     * If copy is true and copySortSource is true, users will be able to sort elements of the sourceContainer
     */
    copySortSource?: boolean;

    /**
     * If true, elements spilled out of their original source container will be reverted to their original drag position
     */
    revertOnSpill?: boolean;

    /**
     * If true, elements spilled out of their original source container will be removed
     */
    removeOnSpill?: boolean;

    /**
     * Determines the axis that is considered when placing the dropped element inside the DOM
     */
    direction?: DrakeDirection;

    /**
     * The container in which the mirrored element will be displayed.
     */
    mirrorContainer?: HTMLElement;

    /**
     * If true, the user is allowed to select text inside an input-like element
     */
    ignoreInputTextSelection?: boolean;

    // Index signature
    [key: string]: boolean | HTMLElement | string | undefined | Function | HTMLElement[];
}

/**
 * If true is returned, triggeringElement from sourceContainer will be cloned on drop
 * @param triggeringElement
 * @param sourceContainer
 */
export type DrakeCloneConfigurator = (triggeringElement?: HTMLElement, sourceContainer?: HTMLElement) => boolean;

export type DrakeDirection = 'vertical' | 'horizontal';

/**
 * The item returned is the flying element dragged while the user presses down their mouse button
 * @param originalElement
 */
export type DragsterFlyingElementProvider = (originalElement?: HTMLElement) => HTMLElement;

/**
 * The item returned is the item that will be added at the position the user will drop the element currently dragged
 * @param itemInMotion
 * @param shadowContainer
 */
export type DragsterShadowElementProvider = (itemInMotion?: HTMLElement, shadowContainer?: HTMLElement) => HTMLElement;

/**
 * Returns the CSS class to add to the transit element (mirrored from originalItem that came from originalContainer and is currently in currentContainer)
 * @param originalItem
 * @param originalContainer
 * @param currentContainer
 */
export type DragsterTransitElementClassNameProvider = (originalItem?: HTMLElement, originalContainer?: HTMLElement, currentContainer?: HTMLElement) => string;
