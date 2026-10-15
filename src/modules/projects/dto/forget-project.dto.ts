import { IsNotEmpty, IsString } from "class-validator";

export class ForgetProjectDto {
  @IsString()
  @IsNotEmpty()
  declare directory: string;
}
