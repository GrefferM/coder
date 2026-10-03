import { IsNotEmpty, IsString } from "class-validator";
import { ProjectConfigDto } from "./project-config.dto";

/** Saving a project: its folder and its config, validated by the module owning the file. */
export class SaveProjectDto {
  @IsString()
  @IsNotEmpty()
  declare directory: string;

  declare config: ProjectConfigDto;

  /** The print of the reading the config was made from; the folder must still hold it, or what the app itself wrote. */
  @IsString()
  @IsNotEmpty()
  declare basis: string;
}
