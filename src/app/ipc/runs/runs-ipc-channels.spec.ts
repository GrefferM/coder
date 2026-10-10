import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CallPlaceDto, ForgetRunDto, RunController } from "../../../modules/runs";
import { CALL_PLACE_CHANNEL, FORGET_RUN_CHANNEL } from "../../../contracts";
import { RUNS_IPC_CHANNELS } from "./runs-ipc-channels";

function controllerRecording(received: unknown[]): RunController {
  return <RunController>(<unknown>{
    forget: async (payload: unknown) => {
      received.push(payload);
    },
    placeOfCall: async (payload: unknown) => {
      received.push(payload);

      return null;
    },
  });
}

describe("RUNS_IPC_CHANNELS", () => {
  it("rebuilds the ask about where a call stands, since an id off the wire is a plain object too", async () => {
    const received: unknown[] = [];

    await RUNS_IPC_CHANNELS[CALL_PLACE_CHANNEL](controllerRecording(received), {
      callId: "11111111-1111-4111-8111-111111111111",
    });

    assert.ok(received[0] instanceof CallPlaceDto);
    assert.equal((<CallPlaceDto>received[0]).callId, "11111111-1111-4111-8111-111111111111");
  });

  it("rebuilds a run the person deletes, so an id nobody typed cannot slip through", async () => {
    const received: unknown[] = [];

    await RUNS_IPC_CHANNELS[FORGET_RUN_CHANNEL](controllerRecording(received), {
      id: "11111111-1111-4111-8111-111111111111",
    });

    assert.ok(received[0] instanceof ForgetRunDto);
  });
});
