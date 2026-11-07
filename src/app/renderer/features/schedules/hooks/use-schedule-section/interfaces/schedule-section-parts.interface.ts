import type { OpenProject } from "../../../../../interfaces";
import type { ScheduleWrites } from "../../use-schedule-writes";

/** What the section stands on: the project and its writes. */
export interface ScheduleSectionParts {
  project: OpenProject;
  writes: ScheduleWrites;
}
