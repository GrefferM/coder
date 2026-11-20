import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useLiveRun } from "./use-live-run";
import { READ_RUN_CHANNEL, WALKS_WRITTEN_CHANNEL } from "../../../../../../contracts";
import { standInBridge } from "../../../../testing";

/** A record of one run that answers with as many questions as it holds, and a push for each write to it. */
function record() {
  const held = {
    questions: 1,
  };
  const written: (() => void)[] = [];
  const invoke = vi.fn(async (channel: string) => {
    if (channel !== READ_RUN_CHANNEL) {
      return undefined;
    }

    return {
      id: "run-1",
      questions: Array.from(
        {
          length: held.questions,
        },
        (_, index) => ({
          id: `question-${index + 1}`,
        }),
      ),
    };
  });

  standInBridge<void>({
    invoke,
    subscribe: (channel, listener) => {
      if (channel === WALKS_WRITTEN_CHANNEL) {
        written.push(() => listener());
      }

      return () => undefined;
    },
  });

  return {
    held,
    invoke,
    written,
  };
}

describe("useLiveRun", () => {
  it("reads the run again when the record is written to, with no count handed in", async () => {
    const { held, written } = record();
    const { result } = renderHook(() => useLiveRun("run-1"));

    await waitFor(() => expect(result.current?.questions).toHaveLength(1));

    held.questions = 2;
    act(() => written.forEach((tell) => tell()));

    await waitFor(() => expect(result.current?.questions).toHaveLength(2));
  });

  it("reads nothing while no conversation has a record yet", () => {
    const { invoke } = record();
    const { result } = renderHook(() => useLiveRun(null));

    expect(result.current).toBeNull();
    expect(invoke).not.toHaveBeenCalled();
  });
});
