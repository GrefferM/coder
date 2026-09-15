import type { AgentStanding, WholeRun } from "../../../../../../record";

/** Inputs of the flat graph: the whole run, walk and all, and which of its turns stands open. */
export interface RunGraphProps {
  run: WholeRun;
  /** How each agent stands today, so a sphere can wear the pill that parts it from the record. */
  standings: AgentStanding[];
  /** The step read open beside the projection; `null` while the pass is read whole. */
  openStepId: string | null;
  onOpen: (stepId: string) => void;
}
