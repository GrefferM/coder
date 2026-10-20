import type { TurnMemory } from "./turn-memory.interface";

/** A turn that goes with no memory: no row yet, the agent's memory switched off, or a tool's first call of a turn. */
export const NO_MEMORY: TurnMemory = {
  thread: [],
  composed: "",
  shared: "",
  covers: 0,
};
