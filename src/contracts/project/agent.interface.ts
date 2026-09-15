import type { NamedAgent } from "./named-agent.interface";
import type { ToolGrant } from "./tool-grant.type";

/** One agent in the open project — a sphere on the canvas. */
export interface Agent extends NamedAgent {
  modelId: string;
  promptId: string | null;
  tools: ToolGrant[];
  isActive: boolean;
  x: number;
  y: number;
  /** Nothing where the file never carried the number; the agent says so instead of standing on one. */
  maxCalls: number | null;
  /** 0 holds to what it was handed, 1 puts it more freely. */
  temperature: number | null;
}
