import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { SCHEDULE_EVERY_MINUTES_LEAST } from "../constants";

export class ProjectScheduleDto {
  @IsUUID()
  declare id: string;

  // Null where unchosen.
  @IsOptional()
  @IsUUID()
  declare agentId: string | null;

  @IsOptional()
  @IsString()
  declare task: string | null;

  @IsOptional()
  @IsInt()
  @Min(SCHEDULE_EVERY_MINUTES_LEAST)
  declare everyMinutes: number | null;

  @IsBoolean()
  declare isActive: boolean;
}
