/**
 * Dragster's default provider for flyingElement. This will clone the original element and append it to the body. #todo
 * @param originalElement
 * @returns {HTMLElement}
 */
export function dragsterDefaultFlyingElementProvider(originalElement: HTMLElement): HTMLElement {
    let rect: ClientRect = originalElement.getBoundingClientRect();

    // copy given element and apply it to given container
    let mirror: HTMLElement = <HTMLElement>originalElement.cloneNode(true);
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
    // todo: use options.mirrorContainer
    document.body.appendChild(mirror);
    document.body.classList.add('gu-unselectable');

    return mirror;
}
