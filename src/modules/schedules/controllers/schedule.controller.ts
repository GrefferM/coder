import { Validate } from "../../../utils/dto-validation";
import { FollowSchedulesDto } from "../dto";
import { ScheduleClock } from "../services";
import type { ScheduleStanding } from "../interfaces";

export class ScheduleController {
  constructor(private readonly clock: ScheduleClock) {}

  @Validate()
  async follow(payload: FollowSchedulesDto): Promise<void> {
    this.clock.follow(payload);
  }

  async standings(): Promise<ScheduleStanding[]> {
    return this.clock.standings();
  }
}
