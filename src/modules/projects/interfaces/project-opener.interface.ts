import type { OpenProjectDto } from "../dto";
import type { KnownProject } from "./known-project.interface";
import type { ProjectRead } from "./project-read.interface";

export interface ProjectOpener {
  findRecent(): Promise<KnownProject[]>;
  open(payload: OpenProjectDto): Promise<ProjectRead>;
}
