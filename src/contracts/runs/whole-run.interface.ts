import type { RunRow } from "./run-row.interface";
import type { WholeQuestion } from "./whole-question.interface";
import type { WholeStep } from "./whole-step.interface";

/** A run opened: its history row, every question and every step. */
export interface WholeRun extends RunRow {
  /** In the order asked. */
  questions: WholeQuestion[];
  walk: WholeStep[];
}
