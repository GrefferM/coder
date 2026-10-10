import type { Walk } from "../../../contracts";

/** A walk at its start: nothing said, waiting, stopped or put away; the row is the one its stream stands on, if any. */
export function begunWalk(questionId: string, askedAt: number, runId: string | null = null): Walk {
  return {
    questionId,
    askedAt,
    runId,
    said: [],
    waiting: {},
    isStopped: false,
    isPutAway: false,
    heldAsk: null,
    unsavedAsk: null,
    heldTurns: {},
    unclosed: null,
  };
}
