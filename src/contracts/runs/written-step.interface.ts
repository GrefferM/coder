import type { StepFacts } from "./step-facts.interface";
import type { WrittenCall } from "./written-call.interface";

/**
 * One agent's turn as the record takes it. Its place is the record's to decide, and its times cross the bridge as
 * milliseconds — a `Date` does not survive the passage.
 */
export interface WrittenStep extends StepFacts {
  runId: string;
  startedAt: number;
  endedAt: number;
  calls: WrittenCall[];
}
