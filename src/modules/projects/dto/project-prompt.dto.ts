import { IsNotEmpty, IsString, IsUUID } from "class-validator";

/** One prompt; `file` is the body's path relative to the project folder, `text` the body itself. */
export class ProjectPromptDto {
  @IsUUID()
  declare id: string;

  @IsString()
  @IsNotEmpty()
  declare name: string;

  @IsString()
  @IsNotEmpty()
  declare file: string;

  @IsString()
  declare text: string;
}
