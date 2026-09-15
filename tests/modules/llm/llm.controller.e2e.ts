import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { LlmController } from "../../../src/modules/llm/controllers/llm.controller";
import { AskAgentDto, StopAgentDto } from "../../../src/modules/llm/dto";
import { AGENT_TEMPERATURE_MOST } from "../../../src/modules/projects/constants";
import type { LlmService } from "../../../src/modules/llm/services";

let asked: { name: string; with: unknown }[] = [];

function controller(): LlmController {
  const service = <LlmService>(<unknown>{
    ask: async (payload: unknown) => {
      asked.push({
        name: "ask",
        with: payload,
      });

      return {
        text: "Готово.",
      };
    },
    stop: (payload: unknown) => {
      asked.push({
        name: "stop",
        with: payload,
      });
    },
  });

  return new LlmController(service);
}

/** A turn as the boundary builds it: a real dto, since a plain object carries no rules to read. */
function turn(patch: Record<string, unknown> = {}): AskAgentDto {
  return Object.assign(new AskAgentDto(), {
    turnId: "turn-1",
    providerId: "openrouter",
    model: "deepseek-v4-flash",
    directory: "/tmp/coder-project",
    maxCalls: 5,
    temperature: 0.3,
    answerCeiling: 4_096,
    systemPrompt: null,
    messages: [
      {
        from: "person",
        text: "Розбий текст на тези",
      },
    ],
    tools: [],
    // Frame 36a: the reach of every declared server rides with the ask; a project with none says so.
    servers: [],
    ...patch,
  });
}

describe("LlmController", () => {
  beforeEach(() => {
    asked = [];
  });

  it("takes a whole turn to the service and answers with what came back", async () => {
    const answer = await controller().ask(turn());

    assert.equal(asked[0].name, "ask");
    assert.deepEqual(answer, {
      text: "Готово.",
    });
  });

  it("ends a turn by the id it was asked under", async () => {
    await controller().stop(
      Object.assign(new StopAgentDto(), {
        turnId: "turn-1",
      }),
    );

    // The payload is a dto instance, so it is asked about field by field: deep equality would compare the shapes too.
    assert.equal(asked.length, 1);
    assert.equal(asked[0].name, "stop");
    assert.equal((<StopAgentDto>asked[0].with).turnId, "turn-1");
  });

  it("refuses a temperature outside the bounds the form itself holds", async () => {
    // Frame 4e: the field on screen cannot hold such a number, so nothing that does may reach a provider.
    await assert.rejects(() =>
      controller().ask(
        turn({
          temperature: AGENT_TEMPERATURE_MOST + 0.5,
        }),
      ),
    );
    await assert.rejects(() =>
      controller().ask(
        turn({
          temperature: -1,
        }),
      ),
    );
    assert.deepEqual(asked, []);
  });

  it("refuses a turn with nothing said in it", async () => {
    // A turn with no messages would spend a call and a key on nothing at all.
    await assert.rejects(() =>
      controller().ask(
        turn({
          messages: [],
        }),
      ),
    );
    assert.deepEqual(asked, []);
  });

  it("refuses a ceiling below the least one and a count of calls below nought", async () => {
    await assert.rejects(() =>
      controller().ask(
        turn({
          answerCeiling: 0,
        }),
      ),
    );
    await assert.rejects(() =>
      controller().ask(
        turn({
          maxCalls: -1,
        }),
      ),
    );
    assert.deepEqual(asked, []);
  });
});
