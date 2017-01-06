export function raiseEvent(element: HTMLElement, type: string, options: eventObjectType = {}): void {
    let event = document.createEvent('Event');
    event.initEvent(type, true, true);

    for (let key in options) {
        (<eventObjectType>event)[key] = options[key];
    }

    element.dispatchEvent(event);
}

// tslint:disable-next-line
export type eventObjectType = {[key: string]: any};
