import type { Walk, WalkSnapshot } from "../walks";

/** A walk at its start: nothing said, waiting, stopped or put away. */
export function aWalk(questionId: string, askedAt: number, runId: string | null = null): Walk {
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

/** A conversation with nothing in it. */
export function anEmptySnapshot(): WalkSnapshot {
  return {
    out: {},
    walks: {},
    saidAgain: [],
    flowRunId: null,
  };
}
