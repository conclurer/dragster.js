/**
 * Dragon's default provider for shadowElement. This will return the original source item directly.
 * @param itemInMotion
 * @returns {HTMLElement}
 */
export function dragsterDefaultShadowElementProvider(itemInMotion: HTMLElement): HTMLElement {
    return itemInMotion;
}
