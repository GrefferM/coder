import type { MemoryFacts } from "./memory-facts.interface";
import type { StepFacts } from "./step-facts.interface";
import type { WrittenCall } from "./written-call.interface";

/** One agent's turn as the record takes it; its times are milliseconds, since a `Date` does not cross the bridge. */
export interface WrittenStep extends StepFacts {
  runId: string;
  startedAt: number;
  endedAt: number;
  calls: WrittenCall[];
  /** The composer's message this turn paid for before it went, or null when its memory was not compressed. */
  compressed: MemoryFacts | null;
}
