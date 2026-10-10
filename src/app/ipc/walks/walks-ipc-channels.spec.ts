import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { OpenWalksDto, PutWalkDto, WalkController } from "../../../modules/walks";
import { OPEN_WALKS_CHANNEL, PUT_WALK_CHANNEL, STOP_WALKS_CHANNEL } from "../../../contracts";
import { WALKS_IPC_CHANNELS } from "./walks-ipc-channels";

function controllerRecording(received: unknown[]): WalkController {
  return <WalkController>(<unknown>{
    open: async (payload: unknown) => {
      received.push(payload);
    },
    put: async (payload: unknown) => {
      received.push(payload);
    },
    stop: async () => {
      received.push("stopped");
    },
  });
}

describe("WALKS_IPC_CHANNELS", () => {
  it("rebuilds an opening into a real DTO, so its decorators are readable", async () => {
    const received: unknown[] = [];

    await WALKS_IPC_CHANNELS[OPEN_WALKS_CHANNEL](controllerRecording(received), {
      directory: "/work/coder",
      config: {},
    });

    assert.ok(received[0] instanceof OpenWalksDto);
  });

  it("rebuilds a question into a real DTO too", async () => {
    const received: unknown[] = [];

    await WALKS_IPC_CHANNELS[PUT_WALK_CHANNEL](controllerRecording(received), {
      agentId: "agent-1",
      text: "питання",
      attached: [],
    });

    assert.ok(received[0] instanceof PutWalkDto);
  });

  it("stops without a payload", async () => {
    const received: unknown[] = [];

    await WALKS_IPC_CHANNELS[STOP_WALKS_CHANNEL](controllerRecording(received), undefined);

    assert.deepEqual(received, ["stopped"]);
  });
});
