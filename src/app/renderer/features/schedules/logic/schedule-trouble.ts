import { SCHEDULE_FIELD_AGENT, SCHEDULE_FIELD_INTERVAL, SCHEDULE_FIELD_TASK } from "../constants";
import type { Agent, ProjectSchedule } from "../../../interfaces";
import type { ScheduleTrouble } from "../interfaces";

/** What keeps the schedule from running, or null where nothing does; a gone agent is told before an empty field. */
export function scheduleTrouble(schedule: ProjectSchedule, agents: Agent[]): ScheduleTrouble | null {
  if (schedule.agentId !== null && !agents.some((agent) => agent.id === schedule.agentId)) {
    return {
      kind: "agentGone",
    };
  }

  const unfilled = unfilledOf(schedule);

  if (unfilled === null) {
    return null;
  }

  return {
    kind: "unfilled",
    field: unfilled,
  };
}

function unfilledOf(schedule: ProjectSchedule): string | null {
  if (schedule.agentId === null) {
    return SCHEDULE_FIELD_AGENT;
  }

  if (schedule.task === null || schedule.task.trim() === "") {
    return SCHEDULE_FIELD_TASK;
  }

  if (schedule.everyMinutes === null) {
    return SCHEDULE_FIELD_INTERVAL;
  }

  return null;
}
