import type { RunRow } from "../interfaces";

/**
 * The hour of a flow's last word: the reply, or the question while still out. History is grouped and ordered by it, so
 * a flow that ran past midnight sits under the day it ended.
 */
export function lastWord(run: RunRow): Date {
  return run.endedAt ?? run.askedAt;
}
