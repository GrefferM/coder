import type { ScheduleFormValues } from "../interfaces";

/** Names each field of a schedule's form in the leave question. */
export const SCHEDULE_AGENT_CHANGE_LABEL = "агент";
export const SCHEDULE_AGENT_DROPPED_LABEL = "агента";
export const SCHEDULE_TASK_CHANGE_LABEL = "завдання";
export const SCHEDULE_TASK_DROPPED_LABEL = "завдання";
export const SCHEDULE_INTERVAL_CHANGE_LABEL = "інтервал";
export const SCHEDULE_INTERVAL_DROPPED_LABEL = "інтервал";
export const SCHEDULE_ACTIVE_CHANGE_LABEL = "стан";
export const SCHEDULE_ACTIVE_DROPPED_LABEL = "стан";
export const SCHEDULE_ACTIVE_ON_LABEL = "увімкнено";
export const SCHEDULE_ACTIVE_OFF_LABEL = "вимкнено";

export const EMPTY_SCHEDULE_FORM_VALUES: ScheduleFormValues = {
  agentId: null,
  task: "",
  everyMinutes: "",
  isActive: false,
};
