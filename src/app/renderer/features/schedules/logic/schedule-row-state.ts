import type { ScheduleStanding } from "../../../interfaces";
import type { ScheduleRowState, ScheduleTrouble } from "../interfaces";

/** The row's state: a trouble wins over the switch, and a task out wins over the countdown. */
export function scheduleRowState(trouble: ScheduleTrouble | null, standing: ScheduleStanding | null): ScheduleRowState {
  if (trouble !== null) {
    return trouble.kind;
  }

  if (standing === null) {
    return "off";
  }

  if (standing.outSince !== null) {
    return "out";
  }

  return standing.isOn ? "on" : "off";
}
