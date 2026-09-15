import { IsNotEmpty, IsString } from "class-validator";

/** The project whose history is being read; a run belongs to a folder and a machine. */
export class ListRunsDto {
  @IsString()
  @IsNotEmpty()
  declare directory: string;
}
