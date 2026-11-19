import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useWidgetRepeats } from "./use-widget-repeats";

describe("useWidgetRepeats", () => {
  it("puts the question again each time its walk ends, as many times as the count, then stops", async () => {
    const put = vi.fn(async () => true);
    const { result, rerender } = renderHook(
      ({ isOut }) =>
        useWidgetRepeats({
          isOut,
          put,
        }),
      {
        initialProps: {
          isOut: false,
        },
      },
    );

    act(() => result.current.setRepeats(2));
    await act(async () => {
      await result.current.send("How are you?", []);
    });

    expect(put).toHaveBeenCalledTimes(1);
    expect(result.current.repeating).toEqual({
      sent: 1,
      total: 2,
    });

    rerender({
      isOut: true,
    });
    await act(async () => {
      rerender({
        isOut: false,
      });
    });

    expect(put).toHaveBeenCalledTimes(2);

    rerender({
      isOut: true,
    });
    await act(async () => {
      rerender({
        isOut: false,
      });
    });

    expect(put).toHaveBeenCalledTimes(2);
    expect(result.current.repeating).toBeNull();
  });

  it("puts nothing more once the repeats are dropped", async () => {
    const put = vi.fn(async () => true);
    const { result, rerender } = renderHook(
      ({ isOut }) =>
        useWidgetRepeats({
          isOut,
          put,
        }),
      {
        initialProps: {
          isOut: false,
        },
      },
    );

    act(() => result.current.setRepeats(3));
    await act(async () => {
      await result.current.send("Again", []);
    });
    rerender({
      isOut: true,
    });
    act(() => result.current.drop());
    await act(async () => {
      rerender({
        isOut: false,
      });
    });

    expect(put).toHaveBeenCalledTimes(1);
  });
});
