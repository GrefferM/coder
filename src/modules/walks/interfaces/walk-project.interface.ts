import type { ProjectConfig } from "../../../contracts";

/** The project a conversation walks in: its folder and its config as it stands now. */
export interface WalkProject {
  readonly directory: string;
  configNow(): ProjectConfig;
}
