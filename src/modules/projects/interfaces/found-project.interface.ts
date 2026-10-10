import type { ProjectConfig } from "../../../contracts";

/** A project found by what the person typed: where it lives and what its file holds. */
export interface FoundProject {
  directory: string;
  config: ProjectConfig;
}
