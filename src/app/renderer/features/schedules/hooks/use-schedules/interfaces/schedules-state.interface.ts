import type { ScheduleStanding } from "../../../../../interfaces";

/** How the open project's schedules stand on this machine, and the switch. */
export interface SchedulesState {
  /** By the schedule's id; a schedule the clock has not answered for yet is absent. */
  standings: Record<string, ScheduleStanding>;
  /** The moment the countdowns are read against, beating on its own. */
  now: number;
  switchOn: (scheduleId: string, isOn: boolean) => Promise<void>;
}
