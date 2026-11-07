import type { ProjectConfig } from "../../../contracts";

/** The project the clock follows: the one open on screen. */
export interface FollowedProject {
  directory: string;
  config: ProjectConfig;
}
