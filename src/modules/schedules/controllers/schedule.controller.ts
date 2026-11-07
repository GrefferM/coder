import { Validate } from "../../../utils/dto-validation";
import { FollowSchedulesDto, SwitchScheduleDto } from "../dto";
import { OpenSchedules } from "../services";
import type { ScheduleStanding } from "../interfaces";

export class ScheduleController {
  constructor(private readonly schedules: OpenSchedules) {}

  @Validate()
  async follow(payload: FollowSchedulesDto): Promise<void> {
    await this.schedules.follow(payload);
  }

  async standings(): Promise<ScheduleStanding[]> {
    return this.schedules.standings();
  }

  @Validate()
  async switch(payload: SwitchScheduleDto): Promise<void> {
    await this.schedules.switch(payload);
  }
}
