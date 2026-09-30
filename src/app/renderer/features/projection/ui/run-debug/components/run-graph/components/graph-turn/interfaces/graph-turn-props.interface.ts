import type { WalkTurn } from "../../../../../../../interfaces";
import type { AgentStanding } from "../../../../../../../../record";

export interface GraphTurnProps {
  turn: WalkTurn;
  /** How this turn's agent stands today; null where the run has no such agent. */
  standing: AgentStanding | null;
  /** The turn being read; wears a ring in its own colour. */
  isOpen: boolean;
  onOpen: () => void;
}
