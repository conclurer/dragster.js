export interface IDragsterOptions {
    // todo: Property containers

    /**
     * Returns the state whether or not triggeringElement can be dragged.
     * @param triggeringElement
     * @param sourceContainer
     * @param dragHandle
     * @param sibling
     */
    moves?(triggeringElement?: HTMLElement, sourceContainer?: HTMLElement, dragHandle?: HTMLElement, sibling?: HTMLElement): boolean;

    /**
     * If true, triggeringElement from sourceContainer can be moved into targetContainer
     * @param triggeringElement
     * @param targetContainer
     * @param sourceContainer
     * @param sibling
     */
    accepts?(triggeringElement?: HTMLElement, targetContainer?: HTMLElement, sourceContainer?: HTMLElement, sibling?: HTMLElement): boolean;

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
    direction?: string;

    /**
     * The container in which the mirrored element will be displayed.
     */
    mirrorContainer?: HTMLElement;

    /**
     * If true, the user is allowed to select text inside an input-like element
     */
    ignoreInputTextSelection?: boolean;

    // Index signature
    [key: string]: any;
}

/**
 * If true is returned, triggeringElement from sourceContainer will be cloned on drop
 * @param triggeringElement
 * @param sourceContainer
 */
export type DrakeCloneConfigurator = (triggeringElement?: HTMLElement, sourceContainer?: HTMLElement)=>boolean;