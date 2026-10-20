import type { RunRow } from "./run-row.interface";
import type { WholeQuestion } from "./whole-question.interface";
import type { WholeMemory } from "./whole-memory.interface";
import type { WholeStep } from "./whole-step.interface";

/** A run opened: its history row, every question and every step. */
export interface WholeRun extends RunRow {
  /** In the order asked. */
  questions: WholeQuestion[];
  walk: WholeStep[];
  /** Every compression of a memory in the run, in the order of the steps that paid for them. */
  memories: WholeMemory[];
}
