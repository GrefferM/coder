import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AddCallDto,
  AddHandoffDto,
  AddStepDto,
  CallPlaceDto,
  ForgetRunDto,
  OpenRunDto,
  RunController,
} from "../../../modules/runs";
import { ADD_RUN_STEP_CHANNEL, CALL_PLACE_CHANNEL, FORGET_RUN_CHANNEL, OPEN_RUN_CHANNEL } from "../../../contracts";
import { RUNS_IPC_CHANNELS } from "./runs-ipc-channels";

function controllerRecording(received: unknown[]): RunController {
  return <RunController>(<unknown>{
    open: async (payload: unknown) => {
      received.push(payload);

      return "run-1";
    },
    step: async (payload: unknown) => {
      received.push(payload);

      return "step-1";
    },
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

  it("rebuilds an opened run into a real DTO, so its decorators are readable", async () => {
    const received: unknown[] = [];

    await RUNS_IPC_CHANNELS[OPEN_RUN_CHANNEL](controllerRecording(received), {
      directory: "/tmp/project",
      startedByAgentId: "22222222-2222-4222-8222-222222222222",
      asked: "Знайди md-файли",
    });

    assert.ok(received[0] instanceof OpenRunDto);
    assert.equal((<OpenRunDto>received[0]).asked, "Знайди md-файли");
  });

  it("rebuilds the calls and the links inside a step as well, since a plain object carries no decorators", async () => {
    const received: unknown[] = [];

    await RUNS_IPC_CHANNELS[ADD_RUN_STEP_CHANNEL](controllerRecording(received), {
      runId: "11111111-1111-4111-8111-111111111111",
      agentId: "22222222-2222-4222-8222-222222222222",
      agentName: "Шукач",
      agentColor: "#6fd3d8",
      model: "deepseek/deepseek-v4-flash-0731",
      providerId: "openrouter",
      asked: "Знайди md-файли",
      said: "ЗНАЙДЕНО",
      state: "done",
      inputTokens: 10,
      outputTokens: 20,
      fromStepIds: [],
      handoffs: [
        {
          toAgentId: "33333333-3333-4333-8333-333333333333",
          stopReason: "busy",
        },
      ],
      startedAt: 1,
      endedAt: 2,
      calls: [
        {
          name: "find_deep",
          arguments: {
            depth: "2",
          },
          line: "find . -maxdepth 2",
          output: "report.md",
          refusal: "",
          exitCode: 0,
          serverId: null,
          serverName: "",
          isFailed: false,
          end: "ran",
          startedAt: 1,
          endedAt: 2,
        },
      ],
    });

    assert.ok(received[0] instanceof AddStepDto);
    assert.ok((<AddStepDto>received[0]).calls[0] instanceof AddCallDto);
    assert.ok((<AddStepDto>received[0]).handoffs[0] instanceof AddHandoffDto);
  });

  it("rebuilds a step that made no calls without inventing a list for it", async () => {
    const received: unknown[] = [];

    await RUNS_IPC_CHANNELS[ADD_RUN_STEP_CHANNEL](controllerRecording(received), {
      runId: "11111111-1111-4111-8111-111111111111",
    });

    assert.deepEqual((<AddStepDto>received[0]).calls, []);
  });

  it("rebuilds a run the person deletes, so an id nobody typed cannot slip through", async () => {
    const received: unknown[] = [];

    await RUNS_IPC_CHANNELS[FORGET_RUN_CHANNEL](controllerRecording(received), {
      id: "11111111-1111-4111-8111-111111111111",
    });

    assert.ok(received[0] instanceof ForgetRunDto);
  });
});
