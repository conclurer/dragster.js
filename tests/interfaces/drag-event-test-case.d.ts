import {eventObjectType} from '../helpers/raise-event';
import {IDragsterOptions} from '../../lib/interfaces/dragster-options';

export interface ITestCaseDragEvent {
    description: string;
    eventOptions: eventObjectType;
    testCaseOptions?: ITestCaseOptions;
}

export interface ITestCaseOptions {
    passes?: boolean;
    containerClick?: boolean;
    tagName?: string;
    dragsterOptions?: IDragsterOptions;
}
