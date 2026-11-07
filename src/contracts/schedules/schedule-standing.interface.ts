/** How one schedule of the open project stands on this machine now. */
export interface ScheduleStanding {
  scheduleId: string;
  /** Whether this machine switched it on. */
  isOn: boolean;
  /** When the clock puts its task next; null while it does not run. */
  nextAt: number | null;
  /** When the task still walking was put; null while none is. */
  outSince: number | null;
}
