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