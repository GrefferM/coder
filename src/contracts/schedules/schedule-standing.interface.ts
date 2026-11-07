/** How one schedule of the open project stands with the clock now. */
export interface ScheduleStanding {
  scheduleId: string;
  /** When the clock puts its task next; null while it does not run. */
  nextAt: number | null;
  /** When the task still walking was put; null while none is. */
  outSince: number | null;
}
