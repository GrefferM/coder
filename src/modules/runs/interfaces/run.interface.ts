import type { RunQuestion } from "./run-question.interface";
import type { WholeStep } from "../../../contracts/runs";

/** One row of the history — a run, without what happened inside it. */
export interface Run {
  id: string;
  startedByAgentId: string;
  asked: string;
  state: string;
  /** The day the flow began, which is not the day of its last question. */
  startedAt: Date;
  /** When the flow was last asked — the row's own hour while nothing has come back yet. */
  askedAt: Date;
  endedAt: Date | null;
  /** How many steps the run took, for the row's «N кроків». */
  steps: number;
  /** What the whole run cost — the money of the steps that carried it; nothing where none did. */
  money: number | null;
  /** How long the agents worked over the whole flow, in milliseconds — every step's own time, added up. */
  worked: number;
  /** The agent it started from, as it stood then; empty when the run wrote no step. */
  startedByAgentName: string;
  startedByAgentColor: string;
  /** Whom the flow was asked last — the name the head of the row wears, standing from the question. */
  askedAgentId: string;
  /** What that agent was called then; today's name wins, and this stands for an agent that is gone. */
  askedAgentName: string;
}

/** The whole run, opened — every question it was asked and every step in the order it ran. */
export interface RunWhole extends Run {
  /** The flow's questions in the order they were asked; each step names the one it grew from. */
  questions: RunQuestion[];
  walk: WholeStep[];
}
