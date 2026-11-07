import type { Agent, ProjectConfig } from "../project";

/** One task a schedule puts, as the clock hands it to the conversation it walks in. */
export interface ScheduledTask {
  scheduleId: string;
  directory: string;
  config: ProjectConfig;
  agent: Agent;
  task: string;
}
