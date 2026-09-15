import { IsInt, IsUUID, Min } from "class-validator";

/** A run ending; how it ended is counted from its steps when the row is read, not written here. */
export class CloseRunDto {
  @IsUUID()
  declare runId: string;

  /** When the last turn of the walk came back, not when the last write finished. */
  @IsInt()
  @Min(0)
  declare endedAt: number;
}
