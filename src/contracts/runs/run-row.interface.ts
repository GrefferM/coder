/** One row of the history — a run, as the record hands it back. */
export interface RunRow {
  id: string;
  startedByAgentId: string;
  /** The agent as it stood when the run walked, not as it is today. */
  startedByAgentName: string;
  startedByAgentColor: string;
  asked: string;
  state: string;
  /** The day the flow began, which is not the day of its last question. */
  startedAt: Date;
  /** When the flow was last asked — the hour the row wears, and where its span starts. */
  askedAt: Date;
  endedAt: Date | null;
  steps: number;
  money: number | null;
  /** How long the agents worked over the whole flow, in milliseconds: every step's own time, added up. */
  worked: number;
  askedAgentId: string;
  /** What that agent was called then; today's name wins, and this stands for an agent that is gone. */
  askedAgentName: string;
}
