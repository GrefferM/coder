import { IsNotEmpty, IsString } from "class-validator";

/** What opening a project takes: the folder to read it from. */
export class OpenProjectDto {
  @IsString()
  @IsNotEmpty()
  declare directory: string;
}
