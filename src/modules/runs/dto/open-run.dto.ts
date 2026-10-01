import { IsArray, IsInt, IsNotEmpty, IsString, IsUUID, Min, ValidateNested } from "class-validator";
import { AttachedDto } from "./attached.dto";

/** A run beginning: its project, whom the person asked, and what. */
export class OpenRunDto {
  @IsString()
  @IsNotEmpty()
  declare directory: string;

  @IsUUID()
  declare startedByAgentId: string;

  /** That agent's name and colour then; the row is named by this, not a later step. */
  @IsString()
  declare startedByAgentName: string;

  @IsString()
  declare startedByAgentColor: string;

  /** The question's own id, minted when it was asked. */
  @IsUUID()
  declare questionId: string;

  @IsString()
  declare asked: string;

  /** The files and folders sent with the question, in the order they were glued in. */
  @IsArray()
  @ValidateNested({
    each: true,
  })
  declare attached: AttachedDto[];

  /** When the person asked, not when the first step landed. */
  @IsInt()
  @Min(0)
  declare startedAt: number;
}
