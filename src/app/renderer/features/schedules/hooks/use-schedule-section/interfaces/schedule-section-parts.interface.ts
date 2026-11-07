import type { OpenProject } from "../../../../../interfaces";
import type { ScheduleWrites } from "../../use-schedule-writes";
import type { SchedulesState } from "../../use-schedules";

/** What the section stands on: the project, its writes, and this machine's switch. */
export interface ScheduleSectionParts {
  project: OpenProject;
  writes: ScheduleWrites;
  schedules: SchedulesState;
}
