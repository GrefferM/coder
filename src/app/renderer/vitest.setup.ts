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

// jsdom has no speech synthesis: a voice list that is empty, and readings that go nowhere.
if (typeof window !== "undefined" && window.speechSynthesis === undefined) {
  const synthesis = Object.assign(new EventTarget(), {
    getVoices: (): SpeechSynthesisVoice[] => [],
    speak: (): void => {},
    cancel: (): void => {},
  });

  Object.defineProperty(window, "speechSynthesis", {
    value: synthesis,
    configurable: true,
  });
  globalThis.SpeechSynthesisUtterance = <typeof SpeechSynthesisUtterance>(<unknown>class {
    voice: SpeechSynthesisVoice | null = null;
    lang = "";
    onend: (() => void) | null = null;
    onerror: (() => void) | null = null;

    constructor(readonly text: string) {}
  });
}

/**
 * @testing-library/react registers auto-cleanup only when `afterEach` is global. The empty `act` settles late `quietly`
 * writes, so React does not warn about updates outside it.
 */
afterEach(async () => {
  await act(async () => {});
  cleanup();
});
