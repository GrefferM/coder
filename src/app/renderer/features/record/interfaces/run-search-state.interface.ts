import type { RunHit } from "./index";

/** What the one search over the record hands the list — the hit of every run the word stands in. */
export interface RunSearchState {
  /** One hit per run, and the runs the word is not in are simply not here. */
  hits: RunHit[];
  /** The word this answer was found for — an answer for an older word must not paint the list. */
  found: string;
}
