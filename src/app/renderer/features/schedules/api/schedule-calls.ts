import { FOLLOW_SCHEDULES_CHANNEL, SCHEDULE_STANDINGS_CHANNEL } from "../../../../../contracts";
import type { ProjectConfig, ScheduleStanding } from "../../../interfaces";

/** Hands the clock the project as the screen holds it. */
export async function followSchedules(directory: string, config: ProjectConfig): Promise<void> {
  await window.electronApi.invoke(FOLLOW_SCHEDULES_CHANNEL, {
    directory,
    config,
  });
}

export async function scheduleStandings(): Promise<ScheduleStanding[]> {
  return window.electronApi.invoke(SCHEDULE_STANDINGS_CHANNEL);
}
