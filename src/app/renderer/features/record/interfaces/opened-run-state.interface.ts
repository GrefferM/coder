import type { WholeRun } from "../../../../../contracts/runs";

/** What the chat knows about the run it was told to open: it, or that it could not be read. */
export interface OpenedRunState {
  run: WholeRun | null;
  isFailed: boolean;
}
