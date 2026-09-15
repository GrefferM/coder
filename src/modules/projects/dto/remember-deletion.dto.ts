import { IsIn, IsNotEmpty, IsObject, IsString } from "class-validator";
import { DELETION_KINDS } from "../constants";

/** A deletion entering the history; `taken` is validated only as an object. */
export class RememberDeletionDto {
  @IsString()
  @IsNotEmpty()
  declare directory: string;

  @IsIn(DELETION_KINDS)
  declare kind: string;

  @IsString()
  @IsNotEmpty()
  declare name: string;

  @IsObject()
  declare taken: Record<string, unknown>;
}
