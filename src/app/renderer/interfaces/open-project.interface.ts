import type { ProjectConfig, ProjectView } from "../../../contracts/project";

/** The open project: its folder, its config, and where this machine last looked. */
export interface OpenProject {
  directory: string;
  config: ProjectConfig;
  view: ProjectView | null;
}
