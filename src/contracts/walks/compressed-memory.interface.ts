import type { MemoryFacts } from "../runs";

/** A memory the composer compressed on the way to a turn, with how much of the turn's memory it now is. */
export interface CompressedMemory {
  /** What the record keeps of it. */
  facts: MemoryFacts;
  /** Characters of memory the turn then carried: the composer's message as the model is given it. */
  carried: number;
}
