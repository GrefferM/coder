import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useWidgetKeys } from "./use-widget-keys";
import { WIDGET_LISTEN_CHANNEL } from "../../../../../../contracts";
import { aVoiceAsk, standInBridge } from "../../../../testing";
import type { WidgetKeysHands } from "../../interfaces";

/** A bridge keeping whoever listens for the shortcut, so the spec can press it. */
function shortcut() {
  const presses: (() => void)[] = [];

  standInBridge<void>({
    subscribe: (channel, listener) => {
      if (channel === WIDGET_LISTEN_CHANNEL) {
        presses.push(() => listener());
      }

      return () => undefined;
    },
  });

  return presses;
}

function hands(patch: Partial<WidgetKeysHands> = {}): WidgetKeysHands {
  return {
    voice: aVoiceAsk(),
    isWalking: false,
    isAsked: false,
    onStopWalk: vi.fn(),
    onStopReading: vi.fn(),
    ...patch,
  };
}

function pressEscape() {
  act(() => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
      }),
    );
  });
}

describe("useWidgetKeys", () => {
  it("presses the microphone at the shortcut, to begin a question or end the one being said", () => {
    const presses = shortcut();
    const press = vi.fn();

    renderHook(() =>
      useWidgetKeys(
        hands({
          voice: aVoiceAsk({
            standing: "recording",
            press,
          }),
        }),
      ),
    );
    act(() => presses.forEach((one) => one()));

    expect(press).toHaveBeenCalledTimes(1);
  });

  it("leaves a question being heard to its words", () => {
    const presses = shortcut();
    const press = vi.fn();

    renderHook(() =>
      useWidgetKeys(
        hands({
          voice: aVoiceAsk({
            standing: "hearing",
            press,
          }),
        }),
      ),
    );
    act(() => presses.forEach((one) => one()));

    expect(press).not.toHaveBeenCalled();
  });

  it("drops a take being said at Escape, and stops nothing else", () => {
    shortcut();
    const cancel = vi.fn();
    const held = hands({
      voice: aVoiceAsk({
        standing: "recording",
        cancel,
      }),
      isWalking: true,
    });

    renderHook(() => useWidgetKeys(held));
    pressEscape();

    expect(cancel).toHaveBeenCalledTimes(1);
    expect(held.onStopWalk).not.toHaveBeenCalled();
    expect(held.onStopReading).not.toHaveBeenCalled();
  });

  it("stops a walk out and silences the reading at Escape", () => {
    shortcut();
    const held = hands({
      isWalking: true,
    });

    renderHook(() => useWidgetKeys(held));
    pressEscape();

    expect(held.onStopWalk).toHaveBeenCalledTimes(1);
    expect(held.onStopReading).toHaveBeenCalledTimes(1);
  });

  it("leaves Escape to a dialog standing open", () => {
    shortcut();
    const held = hands({
      isWalking: true,
      isAsked: true,
    });

    renderHook(() => useWidgetKeys(held));
    pressEscape();

    expect(held.onStopWalk).not.toHaveBeenCalled();
    expect(held.onStopReading).not.toHaveBeenCalled();
  });
});
