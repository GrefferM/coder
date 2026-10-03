import type { ProjectConfig } from "./project-config.interface";

/** A project as read from its folder, with the print of the files it was read from. */
export interface ProjectOnDisk {
  config: ProjectConfig;
  /** What the folder held at the reading; a save names it, so one made from an older reading is refused. */
  print: string;
}
