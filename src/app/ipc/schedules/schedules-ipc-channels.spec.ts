import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FollowSchedulesDto, ScheduleController } from "../../../modules/schedules";
import { FOLLOW_SCHEDULES_CHANNEL, SCHEDULE_STANDINGS_CHANNEL } from "../../../contracts";
import { SCHEDULES_IPC_CHANNELS } from "./schedules-ipc-channels";

function controllerRecording(received: unknown[]): ScheduleController {
  return <ScheduleController>(<unknown>{
    follow: async (payload: unknown) => {
      received.push(payload);
    },
    standings: async () => {
      received.push("standings");

      return [];
    },
  });
}

describe("SCHEDULES_IPC_CHANNELS", () => {
  it("rebuilds a followed project into a real DTO, so its decorators are readable", async () => {
    const received: unknown[] = [];

    await SCHEDULES_IPC_CHANNELS[FOLLOW_SCHEDULES_CHANNEL](controllerRecording(received), {
      directory: "/work/coder",
      config: {},
    });

    assert.ok(received[0] instanceof FollowSchedulesDto);
  });

  it("asks the standings without a payload", async () => {
    const received: unknown[] = [];

    await SCHEDULES_IPC_CHANNELS[SCHEDULE_STANDINGS_CHANNEL](controllerRecording(received), undefined);

    assert.deepEqual(received, ["standings"]);
  });
});
