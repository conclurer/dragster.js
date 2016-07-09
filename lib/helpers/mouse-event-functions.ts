import {MouseEventMapping, mouseEventName} from "../interfaces/dragster-results";
export function whichMouseButton(event: (MouseEvent|TouchEvent)): number {
    if (event instanceof TouchEvent) {
        let e = <TouchEvent>event;
        return e.touches.length;
    }
    else {
        let e = <MouseEvent>event;

        if (e.which !== void 0 && e.which !== 0) return e.which; // see https://github.com/bevacqua/dragula/issues/261
        if (e.buttons !== void 0) return e.buttons;
        let button = e.button;
        if (button !== void 0) { // see https://github.com/jquery/jquery/blob/99e8ff1baa7ae341e94bb89c3e84570c7c3ad9ea/src/event.js#L573-L575
            return button & 1 ? 1 : button & 2 ? 3 : (button & 4 ? 2 : 0);
        }

        return -1;
    }
}

export function getEventNames(defaultEvent: mouseEventName): string[] {
    let touch = <MouseEventMapping>{
        mouseup: 'touchend',
        mousedown: 'touchstart',
        mousemove: 'touchmove'
    };
    let pointers = <MouseEventMapping>{
        mouseup: 'pointerup',
        mousedown: 'pointerdown',
        mousemove: 'pointermove'
    };
    let microsoft = <MouseEventMapping>{
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