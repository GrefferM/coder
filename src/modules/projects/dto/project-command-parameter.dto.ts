import { ArrayUnique, IsArray, IsBoolean, IsIn, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { COMMAND_PARAMETER_TYPES } from "../constants";
import { CommandParameterType } from "../interfaces";

/** One parameter a declared command takes; `values` holds an `enum`'s options and is empty otherwise. */
export class ProjectCommandParameterDto {
  @IsUUID()
  declare id: string;

  @IsString()
  @IsNotEmpty()
  declare name: string;

  @IsIn(COMMAND_PARAMETER_TYPES)
  declare type: CommandParameterType;

  @IsString()
  @IsNotEmpty()
  declare description: string;

  @IsBoolean()
  declare isRequired: boolean;

  @IsArray()
  @IsString({
    each: true,
  })
  @ArrayUnique()
  declare values: string[];
}
