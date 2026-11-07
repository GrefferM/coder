import { MINUTE_MS } from "../constants";
import type { ProjectConfig, ProjectSchedule } from "../../../contracts";
import type { RunnableSchedule } from "../interfaces";

/** The schedules switched on here whose agent stands and whose task and interval are written. */
export function runnableSchedules(config: ProjectConfig, switchedOn: ReadonlySet<string>): RunnableSchedule[] {
  return config.schedules
    .filter((schedule) => switchedOn.has(schedule.id))
    .map((schedule) => runnableOf(config, schedule))
    .filter((runnable) => runnable !== null);
}

function runnableOf(config: ProjectConfig, schedule: ProjectSchedule): RunnableSchedule | null {
  const agent = config.agents.find((standing) => standing.id === schedule.agentId) ?? null;

  if (agent === null || schedule.task === null || schedule.task.trim() === "" || schedule.everyMinutes === null) {
    return null;
  }

  return {
    scheduleId: schedule.id,
    agent,
    task: schedule.task,
    everyMs: schedule.everyMinutes * MINUTE_MS,
  };
}
