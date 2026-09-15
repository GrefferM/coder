import { IsNotEmpty, IsString } from "class-validator";

/** Where this machine is looking in one project; `view` is the renderer's own note and is kept unopened. */
export class RememberProjectViewDto {
  @IsString()
  @IsNotEmpty()
  declare directory: string;

  @IsString()
  declare view: string;
}
