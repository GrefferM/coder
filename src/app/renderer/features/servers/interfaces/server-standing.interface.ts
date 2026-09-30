import type { McpLook } from "../../../interfaces";

/** How a server stands now: what it last said, whether it is being raised, and who holds any of it. */
export interface ServerStanding {
  /** What the server said when last asked; null if it never answered. */
  look: McpLook | null;
  /** The clock of a server being raised; null when not being raised. */
  clock: string | null;
  /** How many functions it hands over and how many agents hold any. */
  functionCount: number;
  agentCount: number;
}
