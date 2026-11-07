import type { Repository } from "typeorm";
import type { ScheduleSwitchEntity } from "../entities";

/** Which schedules this machine switched on, by their ids; a schedule nobody here switched on is off. */
export class ScheduleSwitches {
  constructor(private readonly switches: Repository<ScheduleSwitchEntity>) {}

  async switchedOn(): Promise<Set<string>> {
    const rows = await this.switches.find();

    return new Set(rows.map((row) => row.scheduleId));
  }

  async switchOn(scheduleId: string): Promise<void> {
    await this.switches.save({
      scheduleId,
      switchedOnAt: Date.now(),
    });
  }

  async switchOff(scheduleId: string): Promise<void> {
    await this.switches.delete({
      scheduleId,
    });
  }
}
