import type { ScheduleClock } from "./schedule-clock.service";
import type { ScheduleSwitches } from "./schedule-switches.service";
import type { FollowSchedules, ProjectConfig, ScheduleStanding, SwitchSchedule } from "../../../contracts";

/** The schedules of the project open on screen, as this machine switched them, held by the clock. */
export class OpenSchedules {
  private directory: string | null = null;
  private config: ProjectConfig | null = null;

  constructor(
    private readonly clock: ScheduleClock,
    private readonly switches: ScheduleSwitches,
  ) {}

  async follow({ directory, config }: FollowSchedules): Promise<void> {
    this.directory = directory;
    this.config = config;

    await this.tell();
  }

  standings(): ScheduleStanding[] {
    return this.clock.standings();
  }

  async switch({ scheduleId, isOn }: SwitchSchedule): Promise<void> {
    await (isOn ? this.switches.switchOn(scheduleId) : this.switches.switchOff(scheduleId));
    await this.tell();
  }

  private async tell(): Promise<void> {
    const switchedOn = await this.switches.switchedOn();

    if (this.directory === null || this.config === null) {
      return;
    }

    this.clock.follow({
      directory: this.directory,
      config: this.config,
      switchedOn,
    });
  }
}
