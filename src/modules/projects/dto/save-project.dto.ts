import { IsNotEmpty, IsString } from "class-validator";
import { ProjectConfigDto } from "./project-config.dto";

/** Saving a project: its folder and its config, validated by the module owning the file. */
export class SaveProjectDto {
  @IsString()
  @IsNotEmpty()
  declare directory: string;

  declare config: ProjectConfigDto;
}
