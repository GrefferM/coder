import type { WalkTurn } from "../../../../../../../interfaces";
import type { AgentStanding } from "../../../../../../../../record";

export interface GraphTurnProps {
  turn: WalkTurn;
  /** How this turn's agent stands today; nothing where the run has no such agent. */
  standing: AgentStanding | null;
  /** This turn is the one being read, and wears a ring in its own colour to say so. */
  isOpen: boolean;
  onOpen: () => void;
}
