import { IsArray, IsString } from "class-validator";
import type { PackedAttachment } from "../../../contracts";

export class PutWalkDto {
  @IsString()
  declare agentId: string;

  @IsString()
  declare text: string;

  @IsArray()
  declare attached: PackedAttachment[];
}
