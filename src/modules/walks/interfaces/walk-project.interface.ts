import type { ProjectConfig } from "../../../contracts";

export interface WalkProject {
  readonly directory: string;
  configNow(): ProjectConfig;
}
