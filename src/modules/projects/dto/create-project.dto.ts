import { IsNotEmpty, IsString } from "class-validator";

/** What creating a project takes: the folder it lives in and what to call it. */
export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  declare directory: string;

  @IsString()
  @IsNotEmpty()
  declare name: string;
}
