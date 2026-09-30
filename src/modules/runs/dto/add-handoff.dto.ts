import { IsIn, IsOptional, IsUUID } from "class-validator";
import { RUN_HANDOFF_STOPS } from "../constants";

/** One link a step made: its target, and why it was not taken when it was not. */
export class AddHandoffDto {
  @IsUUID()
  declare toAgentId: string;

  @IsOptional()
  @IsIn(RUN_HANDOFF_STOPS)
  declare stopReason: string | null;
}
