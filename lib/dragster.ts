import {Dragon} from "./dragon";
import {IDragsterOptions} from "./interfaces/dragster-options";
import {DragsterDefaultOptions} from "./dragster-default-options";

export class Dragster {
    // Instance variables
    // Dragon
    protected dragon: Dragon;

    // Options
    protected options: IDragsterOptions;

    // Watched containers
    protected containers: HTMLElement[] = [];

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
}