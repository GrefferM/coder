import type { NamedAgent } from "../../../interfaces";

/**
 * How one agent of a run stands today. The name and colour are what the run is drawn by — today's, since
 * a name is an address and an old one points nowhere; the record's copy stands only for an agent the project has let
 * go. What the record kept beside them is here too, so the screen can say «сьогодні цей крок ішов під іншим ім'ям»
 * without going back to the record for it.
 */
export interface AgentStanding extends NamedAgent {
  /** The record's own name, where the agent is called something else now; nothing where the two are the same. */
  wasName: string | null;
  /** The project no longer has this agent, so the record's name is the only one there is. */
  isGone: boolean;
}
