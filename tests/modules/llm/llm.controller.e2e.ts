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

/** A turn as the boundary builds it: a real dto, since a plain object carries no rules. */
function turn(patch: Record<string, unknown> = {}): AskAgentDto {
  return Object.assign(new AskAgentDto(), {
    turnId: "turn-1",
    agentId: "agent-1",
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
    // The reach of every declared server rides with the ask; empty when none.
    servers: [],
    // Every agent reachable as a tool from this one; empty when none.
    agents: [],
    // The row and question the turn works under.
    runId: "77777777-7777-4777-8777-777777777777",
    questionId: "44444444-4444-4444-8444-444444444444",
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

    // The payload is a dto instance, so fields are asserted one by one; deep equality would compare shapes too.
    assert.equal(asked.length, 1);
    assert.equal(asked[0].name, "stop");
    assert.equal((<StopAgentDto>asked[0].with).turnId, "turn-1");
  });

  it("refuses a temperature outside the bounds the form itself holds", async () => {
    // A number the screen field cannot hold never reaches a provider.
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

  it("takes a turn with no row yet, but not one that leaves the row out or names it by anything but its id", async () => {
    await controller().ask(
      turn({
        runId: null,
      }),
    );

    assert.equal(asked.length, 1);

    await assert.rejects(() =>
      controller().ask(
        turn({
          runId: undefined,
        }),
      ),
    );
    await assert.rejects(() =>
      controller().ask(
        turn({
          questionId: "питання",
        }),
      ),
    );
    assert.equal(asked.length, 1);
  });

  it("refuses a turn with nothing said in it", async () => {
    // A turn with no messages is refused, sparing a call and a key.
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
