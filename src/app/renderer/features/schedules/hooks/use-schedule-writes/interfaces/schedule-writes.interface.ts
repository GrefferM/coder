import type { ScheduleFormValues } from "../../../interfaces";

/** A schedule written or changed, and one taken away; saving hands back its id. */
export interface ScheduleWrites {
  saveSchedule: (scheduleId: string | null, values: ScheduleFormValues) => Promise<string>;
  deleteSchedule: (scheduleId: string) => Promise<void>;
}
