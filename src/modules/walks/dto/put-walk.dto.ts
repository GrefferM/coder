import { IsArray, IsString } from "class-validator";
import type { PackedAttachment } from "../../../contracts";

/** The person's question, put to one agent with the files packed for it. */
export class PutWalkDto {
  @IsString()
  declare agentId: string;

  @IsString()
  declare text: string;

  @IsArray()
  declare attached: PackedAttachment[];
}
