import {
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { COMMAND_NAME_MAX_LENGTH, COMMAND_NAME_PATTERN } from "../../../contracts";
import { ProjectCommandParameterDto } from "./project-command-parameter.dto";

/** A user-declared command: run line, description for the model, parameters. */
export class ProjectCommandDto {
  @IsUUID()
  declare id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(COMMAND_NAME_MAX_LENGTH)
  @Matches(COMMAND_NAME_PATTERN)
  declare name: string;

  @IsString()
  @IsNotEmpty()
  declare description: string;

  @IsString()
  @IsNotEmpty()
  declare run: string;

  @IsArray()
  @ValidateNested({
    each: true,
  })
  @ArrayUnique((parameter: ProjectCommandParameterDto) => parameter.name)
  declare parameters: ProjectCommandParameterDto[];
}
