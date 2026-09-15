import { IsInt, IsNotEmpty, IsString, IsUUID, Min } from "class-validator";

/** A run beginning: the project it belongs to, whom the person asked, and what they asked. */
export class OpenRunDto {
  @IsString()
  @IsNotEmpty()
  declare directory: string;

  @IsUUID()
  declare startedByAgentId: string;

  /** What that agent was called and coloured then — the row is named by this and not by a later step. */
  @IsString()
  declare startedByAgentName: string;

  @IsString()
  declare startedByAgentColor: string;

  /** The question's own id, minted the moment it was asked — the record keeps it, not another. */
  @IsUUID()
  declare questionId: string;

  @IsString()
  declare asked: string;

  /** When the person asked, not when the first step landed: a run begins with the question. */
  @IsInt()
  @Min(0)
  declare startedAt: number;
}
