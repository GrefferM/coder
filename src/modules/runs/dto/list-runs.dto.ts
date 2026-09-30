import { IsNotEmpty, IsString } from "class-validator";

/** The project whose history is read. */
export class ListRunsDto {
  @IsString()
  @IsNotEmpty()
  declare directory: string;
}
