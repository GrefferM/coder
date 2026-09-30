import type { StepFacts } from "./step-facts.interface";
import type { WrittenCall } from "./written-call.interface";

/** One agent's turn as the record takes it; its times are milliseconds, since a `Date` does not cross the bridge. */
export interface WrittenStep extends StepFacts {
  runId: string;
  startedAt: number;
  endedAt: number;
  calls: WrittenCall[];
}
