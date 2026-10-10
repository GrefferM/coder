import { IsUUID } from "class-validator";

/** The run deleted by hand. */
export class LetGoWalksDto {
  @IsUUID()
  declare runId: string;
}
