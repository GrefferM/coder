/** One row of the history — a run, as the record hands it back. */
export interface RunRow {
  id: string;
  startedByAgentId: string;
  /** The agent as it stood when the run walked. */
  startedByAgentName: string;
  startedByAgentColor: string;
  asked: string;
  state: string;
  /** The day the flow began. */
  startedAt: Date;
  /** When the flow was last asked; the hour the row shows and where its span starts. */
  askedAt: Date;
  endedAt: Date | null;
  steps: number;
  money: number | null;
  /** Milliseconds the agents worked over the whole flow: the sum of every step's time. */
  worked: number;
  askedAgentId: string;
  /** The agent's name in the record; today's name wins, this is for an agent that is gone. */
  askedAgentName: string;
}
