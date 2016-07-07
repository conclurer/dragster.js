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
        this.options = <IDragsterOptions>(options || DragsterDefaultOptions);
    }
}