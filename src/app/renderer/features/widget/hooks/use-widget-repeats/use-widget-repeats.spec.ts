import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useWidgetRepeats } from "./use-widget-repeats";

describe("useWidgetRepeats", () => {
  it("puts the question again each time its walk ends, as many times as the count, then stops", async () => {
    const put = vi.fn(async (_agentId: string, _text: string, _attached: unknown[]) => true);
    const { result, rerender } = renderHook(
      ({ isOut }) =>
        useWidgetRepeats({
          isOutOf: () => isOut,
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
      await result.current.send("agent-1", "How are you?", []);
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
    const put = vi.fn(async (_agentId: string, _text: string, _attached: unknown[]) => true);
    const { result, rerender } = renderHook(
      ({ isOut }) =>
        useWidgetRepeats({
          isOutOf: () => isOut,
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
      await result.current.send("agent-1", "Again", []);
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

  it("sends each repeat to the sphere the question began at, whichever is chosen meanwhile", async () => {
    const put = vi.fn(async (_agentId: string, _text: string, _attached: unknown[]) => true);
    const { result, rerender } = renderHook(
      ({ isOut }) =>
        useWidgetRepeats({
          isOutOf: () => isOut,
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
      await result.current.send("agent-a", "Again", []);
    });
    rerender({
      isOut: true,
    });
    await act(async () => {
      rerender({
        isOut: false,
      });
    });

    expect(put.mock.calls.map(([agentId]) => agentId)).toEqual(["agent-a", "agent-a"]);
  });

  it("ends the repeats when a question does not go, so the field opens again", async () => {
    const put = vi.fn(async (_agentId: string, _text: string, _attached: unknown[]) => false);
    const { result } = renderHook(() =>
      useWidgetRepeats({
        isOutOf: () => false,
        put,
      }),
    );

    act(() => result.current.setRepeats(3));
    await act(async () => {
      await result.current.send("agent-a", "Again", []);
    });

    expect(result.current.repeating).toBeNull();
  });
});
