import { IsBoolean, IsUUID } from "class-validator";

export class SwitchScheduleDto {
  @IsUUID()
  declare scheduleId: string;

  @IsBoolean()
  declare isOn: boolean;
}
