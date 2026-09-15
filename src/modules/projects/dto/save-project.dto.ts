import { IsNotEmpty, IsString } from "class-validator";
import { ProjectConfigDto } from "./project-config.dto";

/** What saving a project takes: the folder it lives in, and the config, which the module owning the file validates. */
export class SaveProjectDto {
  @IsString()
  @IsNotEmpty()
  declare directory: string;

  declare config: ProjectConfigDto;
}
