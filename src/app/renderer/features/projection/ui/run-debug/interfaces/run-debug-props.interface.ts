import type { AgentStanding, WholeRun } from "../../../../record";
import type { AgentChange } from "../../../interfaces";

export interface RunDebugProps {
  /** The run read whole from the record; `null` while it is being read or could not be. */
  run: WholeRun | null;
  isFailed: boolean;
  /** How each agent of the run stands today — what the spheres wear under their labels. */
  standings: AgentStanding[];
  /** What the card under the graph holds against today; empty where nothing has moved. */
  changes: AgentChange[];
  /** Which pass of the flow stands open, counted from one, and how many passes it has. */
  place: number;
  passes: number;
  onGo: (place: number) => void;
  onClose: () => void;
}
