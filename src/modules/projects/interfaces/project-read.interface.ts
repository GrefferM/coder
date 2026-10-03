import type { ProjectConfigDto } from "../dto";

/** The config as read from the folder, with the print of the files it was read from. */
export interface ProjectRead {
  config: ProjectConfigDto;
  print: string;
}
