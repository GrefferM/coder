import type { ProjectConfig } from "../../../contracts";
import type { WalkProject } from "../interfaces";

/** The project a conversation walks in, with the config the screen last handed over. */
export class HeldProject implements WalkProject {
  constructor(
    readonly directory: string,
    private config: ProjectConfig,
  ) {}

  configNow(): ProjectConfig {
    return this.config;
  }

  replace(config: ProjectConfig): void {
    this.config = config;
  }
}
