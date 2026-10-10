import type { ProjectConfig } from "../../../contracts";

/** A project found by what the person typed: where it lives and what its file holds. */
export interface CataloguedProject {
  directory: string;
  config: ProjectConfig;
}

/** Where the conversation finds the project a command line names. */
export interface ProjectCatalog {
  find(wanted: string): Promise<CataloguedProject>;
}
