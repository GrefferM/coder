import type { NamedAgent, WaitingAgent } from "../../../../../../../interfaces";

export interface WaitingCardProps {
  waiting: WaitingAgent;
  /** The waiting agent's own colour, which the three head dots take. */
  color: string;
  /** Every agent in the project, so a supplier's row can carry its name. */
  agents: NamedAgent[];
}
