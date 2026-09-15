import { lastWord } from "../logic";
import { RUN_STARTED_PREFIX } from "../constants";
import { dayLabel } from "../../../utils/dates";
import type { RunRow } from "../interfaces";

/** A flow older than its group says so under itself; in its own group it would repeat the hour. */
export function startedLabel(run: RunRow, now: Date): string | null {
  if (run.startedAt.toDateString() === lastWord(run).toDateString()) {
    return null;
  }

  return `${RUN_STARTED_PREFIX}${dayLabel(run.startedAt, now)}`;
}
