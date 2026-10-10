import { answerCeilingNote, callsExhaustedNote } from "../words";
import {
  CHAT_SAID_NOTHING_NOTE,
  CHAT_STOPPED_NOTE,
  RUN_STEP_CALLS,
  RUN_STEP_CEILING,
  RUN_STEP_SILENT,
  RUN_STEP_STOPPED,
  tidyAnswer,
} from "../../../contracts";
import type { CutEnd, SaidTurn } from "../../../contracts";

/**
 * The four ways a turn ends without the agent saying its piece, each with its own end; otherwise null and its own words
 * stand.
 */
export function cutEnd(said: SaidTurn, maxCalls: number, answerCeiling: number): CutEnd | null {
  if (said.isStopped) {
    return {
      note: CHAT_STOPPED_NOTE,
      state: RUN_STEP_STOPPED,
    };
  }

  if (said.isCallsExhausted) {
    return {
      note: callsExhaustedNote(maxCalls),
      state: RUN_STEP_CALLS,
    };
  }

  if (said.isCeilingHit) {
    return {
      note: answerCeilingNote(answerCeiling),
      state: RUN_STEP_CEILING,
    };
  }

  if (tidyAnswer(said.text) === "") {
    return {
      note: CHAT_SAID_NOTHING_NOTE,
      state: RUN_STEP_SILENT,
    };
  }

  return null;
}
