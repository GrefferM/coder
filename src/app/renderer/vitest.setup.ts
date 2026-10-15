import { afterEach } from "vitest";
import { act, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// jsdom has no `scrollIntoView`.
if (Element.prototype.scrollIntoView === undefined) {
  Element.prototype.scrollIntoView = () => {};
}

// jsdom has no pointer capture.
if (Element.prototype.setPointerCapture === undefined) {
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
}

// jsdom has no `ResizeObserver`.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
}

/**
 * @testing-library/react registers auto-cleanup only when `afterEach` is global. The empty `act` settles late `quietly`
 * writes, so React does not warn about updates outside it.
 */
afterEach(async () => {
  await act(async () => {});
  cleanup();
});
