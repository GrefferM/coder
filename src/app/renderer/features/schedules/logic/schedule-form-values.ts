import { EMPTY_SCHEDULE_FORM_VALUES } from "../constants";
import type { ProjectSchedule } from "../../../interfaces";
import type { ScheduleFormValues } from "../interfaces";

/** A schedule as its form holds it, or empty fields for one that does not exist yet. */
export function scheduleFormValues(schedule: ProjectSchedule | null): ScheduleFormValues {
  if (schedule === null) {
    return EMPTY_SCHEDULE_FORM_VALUES;
  }

  return {
    agentId: schedule.agentId,
    task: schedule.task ?? "",
    everyMinutes: schedule.everyMinutes === null ? "" : String(schedule.everyMinutes),
    isActive: schedule.isActive,
  };
}
