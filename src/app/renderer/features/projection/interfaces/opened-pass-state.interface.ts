import type { AgentStanding, WholeRun } from "../../record";
import type { AgentChange } from "./agent-change.interface";

/** The pass whose projection stands over the canvas, and the ways about it. */
export interface OpenedPassState {
  isOpen: boolean;
  /** One question's walk; `null` while closed, being read or unreadable. */
  run: WholeRun | null;
  isFailed: boolean;
  /** Every agent of this pass compared with the project as it stands. */
  standings: AgentStanding[];
  /** Agents whose name or circumstances changed since the run. */
  changes: AgentChange[];
  /** This pass's position in the flow, from one, and the number of passes. */
  place: number;
  passes: number;
  /** Opens the projection on one question of a run, by its id. */
  open: (runId: string, questionId: string) => void;
  /** Goes to another pass of the same flow; a place outside it does nothing. */
  go: (place: number) => void;
  close: () => void;
}
