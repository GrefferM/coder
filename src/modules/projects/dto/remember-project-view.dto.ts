import { IsNotEmpty, IsString } from "class-validator";

/** Where this machine is looking in a project; `view` is the renderer's own note, kept opaque. */
export class RememberProjectViewDto {
  @IsString()
  @IsNotEmpty()
  declare directory: string;

  @IsString()
  declare view: string;
}
