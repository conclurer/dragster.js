import {Dragon} from "./dragon";
import {IDragsterOptions} from "./interfaces/dragster-options";
import {DragsterDefaultOptions} from "./dragster-default-options";
import {IDrake} from "./interfaces/drake";
import {IDragsterStartContext} from "./interfaces/dragster-results";
import {getParentElement, getNextSibling} from "./helpers/node-functions";

export class Dragster implements IDrake {
    // Instance variables
    // Dragon
    protected dragon: Dragon;

    // Options
    protected options: IDragsterOptions;

    // Watched containers
    public containers: HTMLElement[] = [];

    // Dragging State
    public dragging: boolean = false;

    public constructor(options?: IDragsterOptions, ...containers: HTMLElement[]) {
        this.options = DragsterDefaultOptions;

        // Apply given options
        for (let key in options) {
            if (!options.hasOwnProperty(key)) continue;
            this.options[key] = options[key];
        }

        // Apply containers
        this.containers = containers;

        // Apply dragon
        this.dragon = new Dragon();
    }

    // IDrake Fulfilment

    /**
     * Starts to drag one item
     * @param item
     */
    public start(item: HTMLElement): void {

    }

    // todo
    public end(): void {
    }

    // todo
    public cancel(revert?: boolean): void {
    }

    // todo
    public remove(): void {
    }

    // todo
    public on(events: string, callback: Function): void {
    }

    // todo
    public destroy(): void {
    }

    /**
     * Determines the start context of the drag operation.
     * If the drag operation is invalid, null is returned.
     * @param item
     * @returns {IDragsterStartContext}
     */
    protected startContext(item: HTMLElement): IDragsterStartContext {
        // Cancel if there is something currently being dragged
        if (this.dragging && this.dragon.mirror != null) return null;

        // Cancel if the requested element is a container itself
        if (this.isContainer(item)) return null;

        // Detect element to drag
        let dragHandle = item;
        let parent: HTMLElement;
        do {
            parent = getParentElement(item);

            // Cancel if parent is null
            if (parent == null) return null;

            // Jump out if parent is a container
            if (this.isContainer(parent)) break;

            // Cancel if the parent element is marked as invalid
            if (this.options.invalid(item, dragHandle)) return null;

            // Apply parent
            item = parent;
            if (item == null) return null;
        } while (true);

        // Check if resulting item and parent are movable
        let sibling = getNextSibling(item);
        if (!this.options.moves(item, parent, dragHandle, sibling)) return null;

        return {item: item, source: parent};
    }

    /**
     * Returns true if the given item is a container of this
     * @param item
     */
    public isContainer(item: HTMLElement): boolean {
        return this.containers.indexOf(item) !== -1 || this.options.isContainer(item);
    }
}