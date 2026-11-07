import { writtenMinutes } from "./written-minutes";
import {
  SCHEDULE_AGENT_DROPPED_LABEL,
  SCHEDULE_INTERVAL_DROPPED_LABEL,
  SCHEDULE_TASK_DROPPED_LABEL,
} from "../constants";
import type { ScheduleFormValues } from "../interfaces";

/** Fields still empty or not a whole number of minutes, by the names the leave question uses. */
export function scheduleBlocker(values: ScheduleFormValues): string[] {
  const missing: string[] = [];

  if (values.agentId === null) {
    missing.push(SCHEDULE_AGENT_DROPPED_LABEL);
  }

  if (!values.task.trim()) {
    missing.push(SCHEDULE_TASK_DROPPED_LABEL);
  }

  if (writtenMinutes(values.everyMinutes) === null) {
    missing.push(SCHEDULE_INTERVAL_DROPPED_LABEL);
  }

  return missing;
}
