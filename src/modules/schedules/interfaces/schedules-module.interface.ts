import type { ScheduleController } from "../controllers";
import type { ScheduleClock } from "../services";

export interface SchedulesModule {
  controller: ScheduleController;
  clock: ScheduleClock;
}
