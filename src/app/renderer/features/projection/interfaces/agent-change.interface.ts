/**
 * One agent of a run, as it walked («тоді», from the record) against as it stands now («зараз», from the project;
 * absent when the project does not have the agent).
 */
export interface AgentChange {
  id: string;
  /** The current name, or the record's name where the agent is gone. */
  name: string;
  isGone: boolean;
  wasModel: string;
  wasTemperature: number | null;
  nowModel: string | null;
  nowTemperature: number | null;
}
