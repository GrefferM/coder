import { afterEach } from "vitest";
import { act, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// jsdom draws nothing, so it has no way to scroll and no such method at all; the app has one and calls it.
if (Element.prototype.scrollIntoView === undefined) {
  Element.prototype.scrollIntoView = () => {};
}

// jsdom has no pointers to capture, and the field's own strip asks for the pointer it is being pulled by.
if (Element.prototype.setPointerCapture === undefined) {
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
}

// jsdom lays nothing out, so nothing there ever resizes and it has no watcher for it; the app has one and asks.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
}

/**
 * @testing-library/react registers auto-cleanup only when `afterEach` is already global, and it is not here.
 *
 * The flush before it is not a courtesy: a write started with `quietly` settles a tick after the assertion that
 * ended the test, and React then updates state outside `act` and says so on stderr — pages of it, under tests
 * that passed. Letting those last ticks settle **inside** `act` is the honest version of quiet: nothing is
 * hidden, because an update that lands while the test is still running still warns exactly as before.
 */
afterEach(async () => {
  await act(async () => {});
  cleanup();
});
