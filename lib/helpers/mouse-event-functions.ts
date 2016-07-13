import {IMouseEventMapping, mouseEventName} from '../interfaces/dragster-results';

export function whichMouseButton(e: MouseEvent | TouchEvent): number {
    if (event instanceof TouchEvent) {
        return (<TouchEvent>e).touches.length;
    }
    else {
        e = <MouseEvent>e;

        if (e.which !== void 0 && e.which !== 0) return e.which; // see https://github.com/bevacqua/dragula/issues/261
        if (e.buttons !== void 0) return e.buttons;
        let button: number = e.button;
        if (button !== void 0) { // see https://github.com/jquery/jquery/blob/99e8ff1baa7ae341e94bb89c3e84570c7c3ad9ea/src/event.js#L573-L575

            // Disable tslint for bitwise operators
            // tslint:disable-next-line
            return button & 1 ? 1 : button & 2 ? 3 : (button & 4 ? 2 : 0);
        }

        return -1;
    }
}

export function getEventNames(defaultEvent: mouseEventName): string[] {
    let touch: IMouseEventMapping = {
        mouseup: 'touchend',
        mousedown: 'touchstart',
        mousemove: 'touchmove'
    };
    let pointers: IMouseEventMapping = {
        mouseup: 'pointerup',
        mousedown: 'pointerdown',
        mousemove: 'pointermove'
    };
    let microsoft: IMouseEventMapping = {
        mouseup: 'MSPointerUp',
        mousedown: 'MSPointerDown',
        mousemove: 'MSPointerMove'
    };

    if (navigator.pointerEnabled) {
        return [pointers[defaultEvent]];
    }
    else if (navigator.msPointerEnabled) {
        return [microsoft[defaultEvent]];
    }
    else {
        return [touch[defaultEvent], defaultEvent];
    }
}
