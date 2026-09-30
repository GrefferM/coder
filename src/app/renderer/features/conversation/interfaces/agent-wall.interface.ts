import type { NotStartedReason } from "../../../interfaces";

/** The first wall an agent meets before its turn: the card's note and the reason it is drawn for. */
export interface AgentWall {
  note: string;
  reason: NotStartedReason;
}
