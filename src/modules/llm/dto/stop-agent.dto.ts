import { IsString } from "class-validator";

/** «ЗУПИНИТИ»: names the turn to abort by the id it was asked under. */
export class StopAgentDto {
  @IsString()
  declare turnId: string;
}
