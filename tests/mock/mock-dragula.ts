import {IDragsterOptions} from '../../lib/interfaces/dragster-options';
import {MockDragster} from './mock-dragster';

/**
 * Initializes a new Dragster instance
 * Interfaces dragula
 * @param optionsOrNodes
 * @param options
 */
export function mockDragula(optionsOrNodes?: (HTMLElement[]|IDragsterOptions), options?: IDragsterOptions): MockDragster;

/**
 * Initializes a new Dragster instance
 * Interfaces dragula
 * @param initialNodes
 * @param options
 */
export function mockDragula(initialNodes: HTMLElement[], options?: IDragsterOptions): MockDragster {
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

    return new MockDragster(options, ...initialNodes);
}
