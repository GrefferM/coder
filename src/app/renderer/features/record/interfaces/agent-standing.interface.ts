import type { NamedAgent } from "../../../interfaces";

/**
 * How one agent of a run stands today. Name and colour are today's; the record's copy stands only for an agent the
 * project let go. Also holds what the record kept, for «сьогодні цей крок ішов під іншим ім'ям».
 */
export interface AgentStanding extends NamedAgent {
  /** The record's name where the agent is called something else now; null when the same. */
  wasName: string | null;
  /** The project no longer has this agent; the record's name is the only one. */
  isGone: boolean;
}
