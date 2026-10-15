import type { RunHit } from "./index";

export interface RunSearchState {
  /** One hit per place the word stands in, at most `RUN_HITS_LIMIT`. */
  hits: RunHit[];
  /** The word this answer was found for; an answer for an older word must not paint the list. */
  found: string;
  /** The record's own words when the search could not read it; null while it answers. */
  refusal: string | null;
}
