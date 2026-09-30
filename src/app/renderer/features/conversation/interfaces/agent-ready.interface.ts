import type { FilledAgent, FilledModel } from "../../../interfaces";

/** An agent that met no wall, with every number of it and its model filled in. */
export interface AgentReady {
  agent: FilledAgent;
  model: FilledModel;
}
