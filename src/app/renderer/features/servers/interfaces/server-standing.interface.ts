import type { McpLook } from "../../../interfaces";

/** How a server stands right now — what it last said, whether it is being raised, and who holds any of it. */
export interface ServerStanding {
  /** What the server said when it was last asked; nothing where it has never answered. */
  look: McpLook | null;
  /** The clock of a server being raised; nothing where it is not being raised. */
  clock: string | null;
  /** How many functions it hands over, and how many agents hold any of them. */
  functionCount: number;
  agentCount: number;
}
