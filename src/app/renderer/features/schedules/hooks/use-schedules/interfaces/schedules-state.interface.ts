import type { ScheduleStanding } from "../../../../../interfaces";

/** How the open project's schedules stand with the clock. */
export interface SchedulesState {
  /** By the schedule's id; a schedule the clock has not answered for yet is absent. */
  standings: Record<string, ScheduleStanding>;
  /** The moment the countdowns are read against, beating on its own. */
  now: number;
}
