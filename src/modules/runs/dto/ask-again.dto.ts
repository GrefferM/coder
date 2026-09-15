import { IsInt, IsString, IsUUID, Min } from "class-validator";

/** Another question in a flow already recorded — the record goes on instead of splitting. */
export class AskAgainDto {
  @IsUUID()
  declare runId: string;

  /** The question's own id, minted the moment it was asked — the record keeps it, not another. */
  @IsUUID()
  declare questionId: string;

  /** The row says what the conversation stands on now, so the newest question is its text. */
  @IsString()
  declare asked: string;

  /** Whom this question is put to — the head of the row is named by it from this moment on. */
  @IsUUID()
  declare askedAgentId: string;

  /** What that agent is called now, kept so a gone agent still has a name in the record. */
  @IsString()
  declare askedAgentName: string;

  /** When the person asked again; the run stands open from that moment until something closes it. */
  @IsInt()
  @Min(0)
  declare askedAt: number;
}
