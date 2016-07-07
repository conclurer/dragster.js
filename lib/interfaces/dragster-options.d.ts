export interface IDragsterOptions {
    /**
     * Returns the state whether or not triggeringElement can be dragged.
     * @param triggeringElement
     * @param sourceContainer
     * @param dragHandle
     * @param sibling
     */
    moves(triggeringElement?: HTMLElement, sourceContainer?: HTMLElement, dragHandle?: HTMLElement, sibling?: HTMLElement): boolean;
}