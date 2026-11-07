import {
  FOLLOW_SCHEDULES_CHANNEL,
  SCHEDULE_STANDINGS_CHANNEL,
  SWITCH_SCHEDULE_CHANNEL,
} from "../../../../../contracts";
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

/** Switches a schedule on or off on this machine; nothing is written to the project. */
export async function switchSchedule(scheduleId: string, isOn: boolean): Promise<void> {
  await window.electronApi.invoke(SWITCH_SCHEDULE_CHANNEL, {
    scheduleId,
    isOn,
  });
}
