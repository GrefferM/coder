import type { ProjectConfig } from "../../../contracts";

/** The project the clock follows, and the schedules this machine switched on. */
export interface FollowedProject {
  directory: string;
  config: ProjectConfig;
  switchedOn: ReadonlySet<string>;
}
