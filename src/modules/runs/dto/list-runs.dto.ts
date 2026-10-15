import { IsNotEmpty, IsString } from "class-validator";

export class ListRunsDto {
  @IsString()
  @IsNotEmpty()
  declare directory: string;
}
