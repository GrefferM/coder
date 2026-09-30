import type { NamedAgent, WaitingAgent } from "../../../../../../../interfaces";

export interface WaitingCardProps {
  waiting: WaitingAgent;
  /** The waiting agent's colour, taken by the three head dots. */
  color: string;
  /** Every agent of the project, so a supplier's row can show its name. */
  agents: NamedAgent[];
}
