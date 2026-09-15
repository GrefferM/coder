import type { RunRow } from "../../../../../contracts/runs";

/** What the history tab holds — the runs, and whether the record could be read at all. */
export interface RunHistoryState {
  runs: RunRow[];
  isFailed: boolean;
  /** Takes one run out of the record for good. */
  forget: (runId: string) => Promise<void>;
  /** Takes every run of this project, and says how many went. */
  forgetAll: () => Promise<void>;
}
