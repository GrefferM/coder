import { IsObject } from "class-validator";
import type { ProjectConfig } from "../../../contracts";

/** The config as it stands now. */
export class ConfigureWalksDto {
  @IsObject()
  declare config: ProjectConfig;
}
