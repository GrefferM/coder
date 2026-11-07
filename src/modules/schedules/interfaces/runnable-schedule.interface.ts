import type { Agent } from "../../../contracts";

/** A schedule with everything it needs to put its task. */
export interface RunnableSchedule {
  scheduleId: string;
  agent: Agent;
  task: string;
  everyMs: number;
}
