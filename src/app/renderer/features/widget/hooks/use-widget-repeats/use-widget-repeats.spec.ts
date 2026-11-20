import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useWidgetRepeats } from "./use-widget-repeats";
import { aHeardClip } from "../../../../testing";
import type { WidgetQuestion } from "../../interfaces";

/** A question said to a sphere, with its recording. */
function aQuestion(agentId: string, text: string): WidgetQuestion {
  return {
    agentId,
    text,
    attached: [],
    clips: [aHeardClip()],
  };
}

describe("useWidgetRepeats", () => {
  it("puts the question again each time its walk ends, as many times as the count, then stops", async () => {
    const put = vi.fn(async (_question: WidgetQuestion) => true);
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
      await result.current.send(aQuestion("agent-1", "How are you?"));
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
    // What was said went with the first alone.
    expect(put.mock.calls.map(([question]) => question.clips.length)).toEqual([1, 0]);

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
    const put = vi.fn(async (_question: WidgetQuestion) => true);
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
      await result.current.send(aQuestion("agent-1", "Again"));
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
    const put = vi.fn(async (_question: WidgetQuestion) => true);
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
      await result.current.send(aQuestion("agent-a", "Again"));
    });
    rerender({
      isOut: true,
    });
    await act(async () => {
      rerender({
        isOut: false,
      });
    });

    expect(put.mock.calls.map(([question]) => question.agentId)).toEqual(["agent-a", "agent-a"]);
  });

  it("ends the repeats when a question does not go, so the field opens again", async () => {
    const put = vi.fn(async (_question: WidgetQuestion) => false);
    const { result } = renderHook(() =>
      useWidgetRepeats({
        isOutOf: () => false,
        put,
      }),
    );

    act(() => result.current.setRepeats(3));
    await act(async () => {
      await result.current.send(aQuestion("agent-a", "Again"));
    });

    expect(result.current.repeating).toBeNull();
  });
});
