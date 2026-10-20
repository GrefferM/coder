import type { Agent } from "./agent.interface";
import type { AgentMemory } from "./agent-memory.type";

/** The two numbers every agent carries. */
interface NumberedAgent extends Agent {
  maxCalls: number;
  temperature: number;
}

/** A memory that is kept, and so compressed. */
type KeptMemory = Exclude<AgentMemory, "none">;

/**
 * An agent with every number its turn needs written: the two every agent carries, and, while its memory is kept, the
 * two that say when and how far to compress it. An agent without memory has nothing to compress, so those stay as they
 * are.
 */
export type FilledAgent =
  | (NumberedAgent & { memory: "none" })
  | (NumberedAgent & { memory: KeptMemory; compressAt: number; compressTo: number });
