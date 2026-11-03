import type { AgentMemory } from "./agent-memory.type";

/** A memory that is kept, and so compressed. */
type KeptMemory = Exclude<AgentMemory, "none">;

/**
 * An agent's memory as whatever runs it is told: with none there is nothing to compress; with one kept, the share of
 * the ceiling it is compressed at and the share it is written down to.
 */
export type MemorySettings =
  | {
      memory: "none";
    }
  | {
      memory: KeptMemory;
      compressAt: number;
      compressTo: number;
    };
