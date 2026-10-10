import type { ProjectConfig } from "../../../contracts";
import type { WalkProject } from "../interfaces";

/** A project that stands still: a folder and a config that does not change. */
export class StoodProject implements WalkProject {
  readonly directory = "/work/coder";

  constructor(private readonly config: ProjectConfig) {}

  configNow(): ProjectConfig {
    return this.config;
  }
}
