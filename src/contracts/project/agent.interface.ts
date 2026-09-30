import type { NamedAgent } from "./named-agent.interface";
import type { ToolGrant } from "./tool-grant.type";

/** One agent in the open project — a sphere on the canvas. */
export interface Agent extends NamedAgent {
  /** What this agent is for — the description another agent reads when this one is its tool; null where unwritten. */
  purpose: string | null;
  modelId: string;
  promptId: string | null;
  tools: ToolGrant[];
  isActive: boolean;
  /**
   * At a point where lines converge: whether it waits for every live supplier before running once with all
   * they brought, or runs on each input on its own the moment it arrives. True is the wait.
   */
  waitsForAll: boolean;
  x: number;
  y: number;
  /** Nothing where the file never carried the number; the agent says so instead of standing on one. */
  maxCalls: number | null;
  /** 0 holds to what it was handed, 1 puts it more freely. */
  temperature: number | null;
}
