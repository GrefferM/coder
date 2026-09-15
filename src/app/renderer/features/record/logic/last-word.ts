import type { RunRow } from "../interfaces";

/**
 * The hour of a flow's last word — the reply that came back, or, while it is still out, the question
 * itself. The history is grouped and ordered by it, so a flow that ran past midnight stands under the day it ended.
 */
export function lastWord(run: RunRow): Date {
  return run.endedAt ?? run.askedAt;
}
