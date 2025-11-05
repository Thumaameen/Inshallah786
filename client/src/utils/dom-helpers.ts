// DOM Helper Utilities

export function assertIsHTMLElement(element: Element | null): asserts element is HTMLElement {
  if (!(element instanceof HTMLElement)) {
    throw new Error('Element is not an HTMLElement');
  }
}

export function getHTMLElement(selector: string): HTMLElement | null {
  const element = document.querySelector(selector);
  return element instanceof HTMLElement ? element : null;
}

export function clickElement(selector: string): boolean {
  const element = getHTMLElement(selector);
  if (element) {
    element.click();
    return true;
  }
  return false;
}
