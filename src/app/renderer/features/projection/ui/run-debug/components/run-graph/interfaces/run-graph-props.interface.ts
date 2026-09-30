import type { AgentStanding, WholeRun } from "../../../../../../record";

/** Inputs of the flat graph: the whole run, and which turn is open. */
export interface RunGraphProps {
  run: WholeRun;
  /** How each agent stands today, for the pill on a sphere. */
  standings: AgentStanding[];
  /** The step open beside the projection; `null` while the pass is read whole. */
  openStepId: string | null;
  onOpen: (stepId: string) => void;
}
