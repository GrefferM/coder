import type { RunRow } from "../../../../../contracts/runs";

/** The history tab's runs, and what the record said when it failed. */
export interface RunHistoryState {
  runs: RunRow[];
  /** The record's own words when a read or a removal failed; null while it answers. */
  refusal: string | null;
  /** Takes one run out of the record for good; says whether it went. */
  forget: (runId: string) => Promise<boolean>;
  /** Takes every ended run of this project; a running one stays. Says whether the record agreed. */
  forgetAll: () => Promise<boolean>;
}
