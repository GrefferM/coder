import type { RunRow } from "../../../../../contracts";

export interface RunListProps {
  /** The sphere's runs, newest first. */
  runs: RunRow[];
  /** The run the output stands on now; ticked in the list. */
  openedRunId: string | null;
  onOpen: (runId: string) => void;
  /** Asks to delete one run; a run still walking has no cross. */
  onForget: (run: RunRow) => void;
  /** Asks to delete every ended run of the list. */
  onForgetAll: () => void;
}
