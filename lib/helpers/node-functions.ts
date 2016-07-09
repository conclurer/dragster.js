/**
 * Returns the parent element of a given element or null when hitting the root node
 * @param givenElement
 * @returns {HTMLElement}
 */
export function getParentElement(givenElement: HTMLElement): HTMLElement {
    return givenElement.parentElement === <Node>document ? null : givenElement.parentElement;
}

/**
 * Returns the next available sibling of a given element
 * @param givenElement
 * @returns {HTMLElement}
 */
export function getNextSibling(givenElement: HTMLElement): HTMLElement {
    let nextElementSibling = <HTMLElement>givenElement.nextElementSibling;
    if (nextElementSibling) return nextElementSibling;

    // Detect Sibling manually
    let sibling = <Node>givenElement;
    do {
        sibling = sibling.nextSibling;
    } while (sibling && sibling.nodeType !== 1);

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
    let element = <HTMLElement>document.elementFromPoint(x, y);

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
export function getImmediateChild(container: HTMLElement, childOfContainer: HTMLElement): HTMLElement {
    let immediate = childOfContainer;
    while (immediate !== container && getParentElement(immediate) !== container) {
        immediate = getParentElement(immediate);
    }
    if (immediate === document.documentElement) {
        return null;
    }
    return immediate;
}

export function getElementForPosition(dropTarget: HTMLElement, target: HTMLElement, x: number, y: number, direction: string): HTMLElement {
    var horizontal = direction === 'horizontal';

    // Choose method to determine child
    if (target !== dropTarget) {
        // Determine by dropTarget - slower but every position can be found
        let children = dropTarget.children;
        for (let i = 0; i < children.length; i++) {
            let child = <HTMLElement>children[i];
            let rect = child.getBoundingClientRect();

            // Horizontal detection
            if (horizontal && (rect.left + rect.width / 2) > x) return child;

            // Vertical detection
            if (!horizontal && (rect.top + rect.height / 2) > y) return child;
        }

        return null;
    }
    else {
        // Determine by target - faster but only available inside a child element
        let rect = target.getBoundingClientRect();
        if (horizontal) return (x > rect.left + rect.width / 2) ? getNextSibling(target) : target;
        else return (y > rect.top + rect.height / 2) ? getNextSibling(target) : target;
    }
}