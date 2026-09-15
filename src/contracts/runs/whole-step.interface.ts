import type { StepFacts } from "./step-facts.interface";
import type { WholeCall } from "./whole-call.interface";

/** One agent's turn read back — the facts, plus what only a written step has: an id, a place and real dates. */
export interface WholeStep extends StepFacts {
  id: string;
  place: number;
  startedAt: Date;
  endedAt: Date;
  calls: WholeCall[];
}
