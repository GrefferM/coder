import type { ProjectSchedule, ScheduleStanding } from "../../../interfaces";
import type { ScheduleRowState, ScheduleTrouble } from "../interfaces";

/** The row's state: a trouble wins over the switch, and a task out wins over the switch. */
export function scheduleRowState(
  schedule: ProjectSchedule,
  trouble: ScheduleTrouble | null,
  standing: ScheduleStanding | null,
): ScheduleRowState {
  if (trouble !== null) {
    return trouble.kind;
  }

  if (standing !== null && standing.outSince !== null) {
    return "out";
  }

  return schedule.isActive ? "on" : "off";
}
