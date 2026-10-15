import { IsObject } from "class-validator";
import type { ProjectConfig } from "../../../contracts";

export class ConfigureWalksDto {
  @IsObject()
  declare config: ProjectConfig;
}
