import type { RunHit } from "./index";

/** What the search hands the list: the hit of every run containing the word. */
export interface RunSearchState {
  /** One hit per run; runs without the word are absent. */
  hits: RunHit[];
  /** The word this answer was found for; an answer for an older word must not paint the list. */
  found: string;
}
