import { IsNotEmpty, IsString } from "class-validator";

export class SetSecretDto {
  @IsString()
  @IsNotEmpty()
  declare key: string;

  @IsString()
  @IsNotEmpty()
  declare value: string;
}
