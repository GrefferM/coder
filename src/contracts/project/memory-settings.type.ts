import type { AgentMemory } from "./agent-memory.type";

/** A memory that is kept, and so compressed. */
type KeptMemory = Exclude<AgentMemory, "none">;

/**
 * What an agent says about its memory once it is written: with none there is nothing to compress, and with one kept the
 * share of the ceiling it is compressed at and the share it is written down to. Whatever runs an agent, a walk's turn
 * or a call as a tool, is told this and nothing else about it by the rule that decides what its memory needs.
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
