/** A schedule the clock holds a timer for. */
export interface TickingSchedule {
  everyMs: number;
  nextAt: number;
  timer: NodeJS.Timeout;
}
