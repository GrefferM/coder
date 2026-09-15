import type { RunRow } from "./run-row.interface";
import type { WholeQuestion } from "./whole-question.interface";
import type { WholeStep } from "./whole-step.interface";

/** A run opened — the row it is in the history, every question of it and every step. */
export interface WholeRun extends RunRow {
  /** In the order they were asked; each step names the one it grew from. */
  questions: WholeQuestion[];
  walk: WholeStep[];
}
