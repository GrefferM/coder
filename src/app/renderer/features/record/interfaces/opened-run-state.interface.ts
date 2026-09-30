import type { WholeRun } from "../../../../../contracts/runs";

/** The run the chat was told to open, or that it could not be read. */
export interface OpenedRunState {
  run: WholeRun | null;
  isFailed: boolean;
}
