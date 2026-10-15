import { IsNotEmpty, IsString } from "class-validator";

export class RemoveSecretDto {
  @IsString()
  @IsNotEmpty()
  declare key: string;
}
