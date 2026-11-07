import { FollowSchedulesDto, ScheduleController } from "../../../modules/schedules";
import { FOLLOW_SCHEDULES_CHANNEL, SCHEDULE_STANDINGS_CHANNEL } from "../../../contracts";
import type { IpcChannelMap } from "../register-ipc-channels";

/** The open project's schedules; each handler rebuilds a DTO instance from the cloned payload. */
export const SCHEDULES_IPC_CHANNELS: IpcChannelMap<ScheduleController> = {
  [FOLLOW_SCHEDULES_CHANNEL]: (controller, payload) =>
    controller.follow(Object.assign(new FollowSchedulesDto(), payload)),
  [SCHEDULE_STANDINGS_CHANNEL]: (controller) => controller.standings(),
};
