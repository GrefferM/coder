import { IsOptional, IsUUID } from "class-validator";

/** The run the conversation goes on in; none for a conversation with no row yet. */
export class GoOnInWalksDto {
  @IsOptional()
  @IsUUID()
  declare runId: string | null;
}
