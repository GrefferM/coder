import { IsNotEmpty, IsObject, IsString } from "class-validator";
import type { ProjectConfig } from "../../../contracts";

/** The project open on screen, with its config as the screen holds it. */
export class FollowSchedulesDto {
  @IsString()
  @IsNotEmpty()
  declare directory: string;

  @IsObject()
  declare config: ProjectConfig;
}
