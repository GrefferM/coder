import { IsInt, IsString, IsUUID, Min } from "class-validator";

/** Another question in an already recorded flow. */
export class AskAgainDto {
  @IsUUID()
  declare runId: string;

  /** The question's own id, minted when it was asked. */
  @IsUUID()
  declare questionId: string;

  /** The newest question, which is the row's text. */
  @IsString()
  declare asked: string;

  /** Whom this question is put to; it names the row's head from now on. */
  @IsUUID()
  declare askedAgentId: string;

  /** That agent's current name, kept after the agent is gone. */
  @IsString()
  declare askedAgentName: string;

  /** When the person asked again; the run is open from then until closed. */
  @IsInt()
  @Min(0)
  declare askedAt: number;
}
