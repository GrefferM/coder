import type { AgentStanding, WholeRun } from "../../record";
import type { AgentChange } from "./agent-change.interface";

/** The pass whose projection stands over the canvas, and the ways about it. */
export interface OpenedPassState {
  isOpen: boolean;
  /** The pass itself — one question's walk; `null` while it is being read or could not be. */
  run: WholeRun | null;
  isFailed: boolean;
  /** Every agent of this run held against the project as it stands now. */
  standings: AgentStanding[];
  /** Every agent whose name or circumstances have moved since the run walked. */
  changes: AgentChange[];
  /** Where in the flow this pass stands, counted from one, and how many passes the flow has. */
  place: number;
  passes: number;
  /** The projection is opened on one question of a run — the pass is the question, by its own id. */
  open: (runId: string, questionId: string) => void;
  /** Steps to another pass of the same flow; a place outside it changes nothing. */
  go: (place: number) => void;
  close: () => void;
}
