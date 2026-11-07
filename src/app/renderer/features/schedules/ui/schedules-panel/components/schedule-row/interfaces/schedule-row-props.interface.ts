import type { Agent, ProjectSchedule, ScheduleStanding } from "../../../../../../../interfaces";

export interface ScheduleRowProps {
  schedule: ProjectSchedule;
  agents: Agent[];
  /** Null until the clock has answered for this schedule. */
  standing: ScheduleStanding | null;
  /** The moment the countdown is read against. */
  now: number;
  onOpen: () => void;
}
