import { IsNotEmpty, IsString } from "class-validator";

/** Removes one secret by key. */
export class RemoveSecretDto {
  @IsString()
  @IsNotEmpty()
  declare key: string;
}
