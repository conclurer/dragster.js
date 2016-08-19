import {IDragsterOptions} from './interfaces/dragster-options';
import {Dragster} from './dragster';

/**
 * Initializes a new Dragster instance
 * Interfaces dragula
 * @param optionsOrNodes
 * @param options
 */
export function dragula(optionsOrNodes?: (HTMLElement[]|IDragsterOptions), options?: IDragsterOptions): Dragster;

/**
 * Initializes a new Dragster instance
 * Interfaces dragula
 * @param initialNodes
 * @param options
 */
export function dragula(initialNodes: HTMLElement[], options?: IDragsterOptions): Dragster {
    let numArgs: number = arguments.length;
    if (numArgs === 1 && Array.isArray(initialNodes) === false) {
        // Only options is given, reset arguments
        // tslint:disable-next-line
        options = <any>initialNodes;
        initialNodes = [];
    }

    // Set empty options array if options not given
    if (options == null) {
        options = {};
    }

    if (initialNodes == null) {
        return new Dragster(options);
    }
    else {
        return new Dragster(options, ...initialNodes);
    }
}
