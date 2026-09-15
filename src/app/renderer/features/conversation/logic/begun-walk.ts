import type { Walk } from "../interfaces";

/**
 * A walk the moment it begins — nothing said, nothing waiting, nothing stopped, nothing put away. The row
 * is the one its stream stands on; a stream that has none learns it when the question opens one.
 */
export function begunWalk(questionId: string, askedAt: number, runId: string | null = null): Walk {
  return {
    questionId,
    askedAt,
    runId,
    said: [],
    waiting: {},
    isStopped: false,
    isPutAway: false,
  };
}
