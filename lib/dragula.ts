import {IDragsterOptions} from "./interfaces/dragster-options";

/**
 * Initializes a new Dragster instance
 * Interfaces dragula
 * @param optionsOrNodes
 */
export function dragula(optionsOrNodes?: (HTMLElement[]|IDragsterOptions)): any;

/**
 * Initializes a new Dragster instance
 * Interfaces dragula
 * @param initialNodes
 * @param options
 */
export function dragula(initialNodes: HTMLElement[], options?: IDragsterOptions): any {
    let numArgs = arguments.length;
    if (numArgs == 1 && Array.isArray(initialNodes) === false) {
        // Only options is given, reset arguments
        options = <any>initialNodes;
        initialNodes = [];
    }
}