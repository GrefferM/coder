import { IsNotEmpty, IsString } from "class-validator";

export class OpenProjectDto {
  @IsString()
  @IsNotEmpty()
  declare directory: string;
}
