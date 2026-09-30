import { IsInt, IsUUID, Min } from "class-validator";

/** A run ending; the outcome is counted from its steps on read, not written. */
export class CloseRunDto {
  @IsUUID()
  declare runId: string;

  /** When the last turn of the walk came back, not when the last write finished. */
  @IsInt()
  @Min(0)
  declare endedAt: number;
}
