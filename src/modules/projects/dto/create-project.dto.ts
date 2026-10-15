import { IsNotEmpty, IsString } from "class-validator";

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  declare directory: string;

  @IsString()
  @IsNotEmpty()
  declare name: string;
}
