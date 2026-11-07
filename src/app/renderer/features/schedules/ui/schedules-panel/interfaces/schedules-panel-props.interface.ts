import type { Agent, ProjectSchedule } from "../../../../../interfaces";
import type { ScheduleSection, SchedulesState } from "../../../hooks";

export interface SchedulesPanelProps {
  schedules: ProjectSchedule[];
  agents: Agent[];
  clock: SchedulesState;
  section: ScheduleSection;
  /** Opening another form or leaving this one asks first where work is typed in. */
  onOpenForm: (scheduleId: string | "new") => void;
  onCancelForm: () => void;
}
