import type { TurnMemory } from "../interfaces";

/** A turn that goes with no memory: no row yet, or the agent's memory switched off. */
export const NO_MEMORY: TurnMemory = {
  thread: [],
  shared: "",
};
