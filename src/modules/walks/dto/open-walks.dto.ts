import { IsNotEmpty, IsObject, IsString } from "class-validator";
import type { ProjectConfig } from "../../../contracts";

/** The conversation of a project begins, with its config as the screen holds it. */
export class OpenWalksDto {
  @IsString()
  @IsNotEmpty()
  declare directory: string;

  @IsObject()
  declare config: ProjectConfig;
}
