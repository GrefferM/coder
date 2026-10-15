import type { AgentStanding, WholeRun } from "../../../../record";
import type { AgentChange } from "../../../interfaces";

export interface RunDebugProps {
  /** One pass of the run, read from the record; `null` while being read or unreadable. */
  run: WholeRun | null;
  isFailed: boolean;
  /** How each of the pass's agents stands today, for the pills under the spheres. */
  standings: AgentStanding[];
  /** What the card under the graph compares with today; empty when nothing changed. */
  changes: AgentChange[];
  /** The open pass's position in the flow, from one, and the number of passes. */
  place: number;
  passes: number;
  onGo: (place: number) => void;
  onClose: () => void;
}
