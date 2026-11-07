import type { ScheduleFormValues } from "../../../interfaces";

/** A schedule written or changed, and one taken away. */
export interface ScheduleWrites {
  saveSchedule: (scheduleId: string | null, values: ScheduleFormValues) => Promise<void>;
  deleteSchedule: (scheduleId: string) => Promise<void>;
}
