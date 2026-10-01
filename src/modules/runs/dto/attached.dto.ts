import { IsArray, IsIn, IsNotEmpty, IsString } from "class-validator";
import { ATTACHMENT_KINDS } from "../../../contracts";
import type { AttachmentKind } from "../../../contracts";

/** One file or folder sent with a question, packed as it went into the turn. */
export class AttachedDto {
  @IsString()
  @IsNotEmpty()
  declare path: string;

  @IsString()
  @IsNotEmpty()
  declare name: string;

  @IsIn(ATTACHMENT_KINDS)
  declare kind: AttachmentKind;

  @IsString()
  declare text: string;

  @IsArray()
  @IsString({
    each: true,
  })
  declare binaries: string[];
}
