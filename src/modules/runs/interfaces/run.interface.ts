import type { RunQuestion } from "./run-question.interface";
import type { WholeStep } from "../../../contracts/runs";

/** One row of the history: a run without what happened inside it. */
export interface Run {
  id: string;
  startedByAgentId: string;
  asked: string;
  state: string;
  /** The day the flow began, not of its last question. */
  startedAt: Date;
  /** When the flow was last asked; the row's own hour while nothing has come back. */
  askedAt: Date;
  endedAt: Date | null;
  /** How many steps the run took, for the row's «N кроків». */
  steps: number;
  /** Total cost of the steps that carried one; null where none did. */
  money: number | null;
  /** Milliseconds the agents worked over the flow: the sum of every step's time. */
  worked: number;
  /** The agent it started from, as it then stood; empty when no step was written. */
  startedByAgentName: string;
  startedByAgentColor: string;
  /** Whom the flow was last asked; names the row's head. */
  askedAgentId: string;
  /** The agent's name then; today's name wins, this covers a gone agent. */
  askedAgentName: string;
}

/** The whole run: every question and every step in running order. */
export interface RunWhole extends Run {
  /** The flow's questions in asking order; each step names the one it grew from. */
  questions: RunQuestion[];
  walk: WholeStep[];
}
