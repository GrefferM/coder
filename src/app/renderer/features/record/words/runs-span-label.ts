import { RUNS_SPAN_MIDDLE, RUNS_SPAN_PREFIX } from "../constants";
import { daySpoken } from "../../../utils/dates";
import type { RunRow } from "../interfaces";

/** The days a list of runs spans, newest first; empty where all runs are of one day. */
export function runsSpanLabel(runs: RunRow[], now: Date): string {
  const newest = daySpoken(runs[0].startedAt, now);
  const oldest = daySpoken(runs[runs.length - 1].startedAt, now);

  return newest === oldest ? "" : `${RUNS_SPAN_PREFIX}${newest}${RUNS_SPAN_MIDDLE}${oldest}`;
}
