import { IsNotEmpty, IsString } from "class-validator";

/** Writing one secret: which one it is, and what it now holds. */
export class SetSecretDto {
  @IsString()
  @IsNotEmpty()
  declare key: string;

  @IsString()
  @IsNotEmpty()
  declare value: string;
}
