import type { ScheduledTask } from "../../../contracts";

/** Where a schedule's task is put: each schedule's own conversation. */
export interface ScheduledAsker {
  ask(task: ScheduledTask): void;
  /** Whether the task the schedule put last is still walking. */
  isOut(scheduleId: string): boolean;
}
