import {DrakeDirection} from '../interfaces/dragster-options';

/**
 * Returns the parent element of a given element or null when hitting the root node
 * @param givenElement
 * @returns {HTMLElement}
 */
export function getParentElement(givenElement: HTMLElement): HTMLElement | null {
    if (givenElement == null) return null;
    return givenElement.parentElement === <Node>document ? null : givenElement.parentElement;
}

/**
 * Returns the next available sibling of a given element
 * @param givenElement
 * @returns {HTMLElement}
 */
export function getNextSibling(givenElement: HTMLElement): HTMLElement | null {
    if (givenElement == null) return null;

    let nextElementSibling: HTMLElement | null = <HTMLElement>givenElement.nextElementSibling;
    if (nextElementSibling != null) return nextElementSibling;

    // Detect Sibling manually
    let sibling: Node | null = <Node>givenElement;
    do {
        sibling = sibling.nextSibling;
    } while (sibling != null && sibling.nodeType !== 1);

    return <HTMLElement>sibling;
}

/**
 * Returns the DOM element at point x|y.
 * If flyingElement is present, it will be temporary hidden to detect the element behind it.
 * @param x
 * @param y
 * @param flyingElement
 * @returns {HTMLElement}
 */
export function getElementBehindPoint(x: number, y: number, flyingElement?: HTMLElement): HTMLElement {
    // Temporary hide element
    if (flyingElement) flyingElement.style.display = 'none';

    // Capture element below
    let element: HTMLElement = <HTMLElement>document.elementFromPoint(x, y);

    // Show element again
    if (flyingElement) flyingElement.style.display = null;

    return element;
}

/**
 * Returns the parent of childOfContainer that is the direct child of container
 * @param container
 * @param childOfContainer
 * @returns {HTMLElement}
 */
export function getImmediateChild(container: HTMLElement, childOfContainer: HTMLElement): HTMLElement | null {
    // Cancel if childOfContainer is equal to container
    if (container === childOfContainer) return null;

    let immediate: HTMLElement = childOfContainer;
    while (immediate !== container && getParentElement(immediate) !== container) {
        let parent: HTMLElement | null = getParentElement(immediate);
        if (parent == null) break;

        immediate = parent;
    }
    if (immediate === document.documentElement) {
        return null;
    }
    return immediate;
}

/**
 * Returns the element in dropTarget that is currently located at position x|y
 * @param dropTarget
 * @param target
 * @param x
 * @param y
 * @param direction
 * @returns {HTMLElement}
 */
export function getElementForPosition(dropTarget: HTMLElement, target: HTMLElement, x: number, y: number, direction: DrakeDirection): HTMLElement | null {
    let horizontal: boolean = direction === 'horizontal';

    // Choose method to determine child
    if (target !== dropTarget) {
        // Determine by dropTarget - slower but every position can be found
        let children: HTMLCollection = dropTarget.children;
        for (let i: number = 0; i < children.length; i++) {
            let child: HTMLElement = <HTMLElement>children[i];
            let rect: ClientRect = child.getBoundingClientRect();

            // Horizontal detection
            if (horizontal && (rect.left + rect.width / 2) > x) return child;

            // Vertical detection
            if (!horizontal && (rect.top + rect.height / 2) > y) return child;
        }

        return null;
    }
    else {
        // Determine by target - faster but only available inside a child element
        let rect: ClientRect = target.getBoundingClientRect();
        if (horizontal) return (x > rect.left + rect.width / 2) ? getNextSibling(target) : target;
        else return (y > rect.top + rect.height / 2) ? getNextSibling(target) : target;
    }
}

export function isInput(givenElement: HTMLElement): boolean {
    let nativeInputElement: boolean = (givenElement instanceof HTMLInputElement || givenElement instanceof HTMLTextAreaElement || givenElement instanceof HTMLSelectElement);
    if (nativeInputElement) return true;

    // Check if givenElement or one of its parent has contentEditable
    let element: HTMLElement | null = givenElement;

    do {
        // Wait for explicit contentEditable statements
        if (element!.contentEditable === 'true') return true;
        if (element!.contentEditable === 'false') return false;

        // Go up one level
        element = getParentElement(givenElement);

    } while (element != null);

    return false;
}
