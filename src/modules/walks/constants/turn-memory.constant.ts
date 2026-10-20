import type { TurnMemory } from "../../../contracts";

/** A turn that goes with no memory: no row yet, or the agent's memory switched off. */
export const NO_MEMORY: TurnMemory = {
  thread: [],
  composed: "",
  shared: "",
  covers: 0,
};
