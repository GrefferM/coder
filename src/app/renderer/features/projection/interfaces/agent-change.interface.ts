/**
 * One agent of a run, as it walked against as it stands now. «Тоді» is the record's and never moves;
 * «зараз» is the project's, and there is none where the project no longer has the agent.
 */
export interface AgentChange {
  id: string;
  /** What the agent is called now — the record's own name where it is gone, since that is the only one left. */
  name: string;
  isGone: boolean;
  wasModel: string;
  wasTemperature: number | null;
  nowModel: string | null;
  nowTemperature: number | null;
}
