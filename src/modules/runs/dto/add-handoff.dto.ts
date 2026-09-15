import { IsIn, IsOptional, IsUUID } from "class-validator";
import { RUN_HANDOFF_STOPS } from "../constants";

/** One link a step made: whom it went to, and the word for why it did not go where it did not. */
export class AddHandoffDto {
  @IsUUID()
  declare toAgentId: string;

  @IsOptional()
  @IsIn(RUN_HANDOFF_STOPS)
  declare stopReason: string | null;
}
