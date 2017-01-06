/**
 * Dragster's default provider for flyingElement. This will clone the original element and return it for further operations.
 * @param originalElement
 * @returns {HTMLElement}
 */
export function dragsterDefaultFlyingElementProvider(originalElement: HTMLElement): HTMLElement {
    let rect = originalElement.getBoundingClientRect();

    // copy given element and apply it to given container
    let mirror = <HTMLElement>originalElement.cloneNode(true);
    mirror.style.width = `${rect.width}px`;
    mirror.style.height = `${rect.height}px`;
    mirror.style.top = `${rect.top}px`;
    mirror.style.left = `${rect.left}px`;

    // Dragula .gu-mirror CSS class
    mirror.style.position = 'fixed';
    mirror.style.margin = '0';
    mirror.style.zIndex = '9999';
    mirror.classList.add('gu-mirror');
    mirror.classList.remove('gu-transit');

    return mirror;
}
