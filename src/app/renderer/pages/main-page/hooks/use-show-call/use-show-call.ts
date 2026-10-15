import { useCallback } from "react";
import { callPlace } from "../../../../features/record";
import type { OpenCalls } from "../../../../features/conversation";
import type { RailStanding } from "../use-rail-standing";
import type { ShownStream } from "../use-shown-stream";

/**
 * «ПОКАЗАТИ ВИКЛИК»: hands the chat over to the call a catalogue row refers to: opens its run in the stream as a
 * history row would, scrolls to the call's message. A call the record cannot place, or whose run is not listed,
 * returns `false` and opens nothing.
 */
export function useShowCall(
  stream: ShownStream,
  rail: RailStanding,
  openCalls: OpenCalls,
): (callId: string) => Promise<boolean> {
  const { openRun, runs } = stream;
  const { openChat } = rail;
  const { open } = openCalls;

  return useCallback(
    async (callId: string) => {
      const place = await callPlace(callId);

      if (place === null) {
        return false;
      }

      const row = runs.find((run) => run.id === place.runId) ?? null;

      if (row === null) {
        return false;
      }

      openRun(row, {
        runId: place.runId,
        questionId: place.questionId,
        stepId: place.stepId,
        agentId: null,
        agentName: null,
        step: null,
        at: new Date(),
        found: "",
        isCall: true,
      });
      openChat();
      open(callId);

      return true;
    },
    [runs, openRun, openChat, open],
  );
}
