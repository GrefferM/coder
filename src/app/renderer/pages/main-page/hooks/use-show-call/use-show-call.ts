import { useCallback } from "react";
import { callPlace } from "../../../../features/record";
import type { OpenCalls } from "../../../../features/conversation";
import type { RailStanding } from "../use-rail-standing";
import type { ShownStream } from "../use-shown-stream";

/**
 * «ПОКАЗАТИ ВИКЛИК» — the catalogue hands the chat over to the call its row is talking about. The chat
 * then does what it always does with a place: it turns to that agent, stands the run in the stream and rides to the
 * message the call was made from. Nothing opens over anything — «третя копія — третя правда».
 *
 * The row itself opens without a press, and it is the one place where that happens: the hand was there, just
 * in another room. A call the record can no longer place leads nowhere and nothing happens at all — the run may
 * have been forgotten, and a call written before the record kept the stream's own id has another one.
 */
export function useShowCall(stream: ShownStream, rail: RailStanding, openCalls: OpenCalls): (callId: string) => void {
  const { openRun, runs } = stream;
  const { openChat } = rail;
  const { open } = openCalls;

  return useCallback(
    (callId: string) => {
      void callPlace(callId).then((place) => {
        if (place === null) {
          return;
        }

        const row = runs.find((run) => run.id === place.runId) ?? null;

        if (row === null) {
          return;
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
      });
    },
    [runs, openRun, openChat, open],
  );
}
