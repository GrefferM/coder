import type { ProjectConfig, ProjectView } from "../../../contracts/project";

/** The open project: its folder, its config, and where this machine last looked. */
export interface OpenProject {
  directory: string;
  config: ProjectConfig;
  /** What the folder held when the config was read or last saved; every save names it. */
  print: string;
  view: ProjectView | null;
}
