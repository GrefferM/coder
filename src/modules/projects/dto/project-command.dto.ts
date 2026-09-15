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

/** A command the user declares — a run line, a description for the model, and its parameters. */
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
