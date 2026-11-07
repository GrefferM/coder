import { ScheduleController } from "./controllers";
import { ScheduleClock } from "./services";
import type { ScheduledAsker, SchedulesModule } from "./interfaces";

export function createSchedulesModule(asker: ScheduledAsker): SchedulesModule {
  const clock = new ScheduleClock(asker);

  return {
    controller: new ScheduleController(clock),
    clock,
  };
}
