import type { MemoryFacts } from "./memory-facts.interface";

/** A compression read back, with the step it was paid in. */
export interface WholeMemory extends MemoryFacts {
  id: string;
  stepId: string;
  /** The place of that step: of two compressions of one memory, the later step's is the one that stands. */
  stepPlace: number;
}
