import { ScheduleController } from "./controllers";
import { ScheduleSwitchEntity } from "./entities";
import { OpenSchedules, ScheduleClock, ScheduleSwitches } from "./services";
import type { DataSource } from "typeorm";
import type { ScheduledAsker, SchedulesModule } from "./interfaces";

export function createSchedulesModule(dataSource: DataSource, asker: ScheduledAsker): SchedulesModule {
  const switchRepository = dataSource.getRepository(ScheduleSwitchEntity);
  const switches = new ScheduleSwitches(switchRepository);
  const clock = new ScheduleClock(asker);
  const schedules = new OpenSchedules(clock, switches);

  return {
    controller: new ScheduleController(schedules),
    clock,
  };
}
