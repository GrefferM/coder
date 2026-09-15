import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AskAgentDto, LlmController, StopAgentDto } from "../../../modules/llm";
import { ASK_AGENT_CHANNEL, STOP_AGENT_CHANNEL } from "../../../contracts";
import { LLM_IPC_CHANNELS } from "./llm-ipc-channels";

function controllerRecording(received: unknown[]): LlmController {
  return <LlmController>(<unknown>{
    ask: async (payload: unknown) => {
      received.push(payload);
    },
    stop: async (payload: unknown) => {
      received.push(payload);
    },
  });
}

describe("LLM_IPC_CHANNELS", () => {
  it("rebuilds one asked turn into a real DTO, so its decorators are readable", async () => {
    const received: unknown[] = [];

    await LLM_IPC_CHANNELS[ASK_AGENT_CHANNEL](controllerRecording(received), {
      turnId: "turn-1",
      providerId: "anthropic",
      model: "claude-sonnet-4-5",
      systemPrompt: null,
      messages: [
        {
          from: "person",
          text: "Привіт",
        },
      ],
    });

    assert.ok(received[0] instanceof AskAgentDto);
    assert.equal((<AskAgentDto>received[0]).model, "claude-sonnet-4-5");
  });

  it("rebuilds a stop into a real DTO too, so an id nobody typed cannot slip through", async () => {
    const received: unknown[] = [];

    await LLM_IPC_CHANNELS[STOP_AGENT_CHANNEL](controllerRecording(received), {
      turnId: "turn-1",
    });

    assert.ok(received[0] instanceof StopAgentDto);
  });
});
