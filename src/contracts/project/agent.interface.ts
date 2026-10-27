import type { AgentMemory } from "./agent-memory.type";
import type { NamedAgent } from "./named-agent.interface";
import type { ToolGrant } from "./tool-grant.type";

/** One agent in the open project — a sphere on the canvas. */
export interface Agent extends NamedAgent {
  /** What the agent is for: the description another agent reads when this one is its tool; null when unwritten. */
  purpose: string | null;
  modelId: string;
  promptId: string | null;
  tools: ToolGrant[];
  isActive: boolean;
  /**
   * At a convergence point: true waits for every live supplier and runs once with all their output; false runs on each
   * input as it arrives.
   */
  waitsForAll: boolean;
  memory: AgentMemory;
  x: number;
  y: number;
  /** Null when the file carries no number. */
  maxCalls: number | null;
  /** 0 holds to what it was handed, 1 puts it more freely. */
  temperature: number | null;
  /**
   * The share of the model's context ceiling, in percent, at which the agent's memory is compressed before a turn.
   * Null when the file carries no number; asked of an agent only while its memory is not switched off.
   */
  compressAt: number | null;
  /** The share of the ceiling, in percent, the compressed memory is written down to; null as `compressAt` is. */
  compressTo: number | null;
}
