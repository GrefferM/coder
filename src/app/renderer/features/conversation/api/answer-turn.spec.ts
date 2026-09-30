import { describe, expect, it, vi } from "vitest";
import { answerTurn, stopTurn } from "./answer-turn";
import type { TurnToAsk } from "../interfaces";
import type { GrantTargets } from "../../../interfaces";
import { ASK_AGENT_CHANNEL, STOP_AGENT_CHANNEL } from "../../../../../contracts";
import { LLM_NO_KEY } from "../constants";
import { RUN_STEP_DONE, RUN_STEP_FAILED } from "../../record";
import { aModel, aPrompt, anAgent, standInBridge } from "../../../testing";
import type { ProviderState } from "../../../interfaces";
import { fellNote } from "../words";

const OPENROUTER: ProviderState = {
  id: "openrouter",
  name: "OpenRouter",
  kind: "remote",
  needs: ["key"],
  takesTools: true,
  customaryAddress: null,
  keyHint: "sk-…f31a",
  address: null,
};

const AGENT = anAgent({
  id: "agent-1",
  name: "ТЕЗАР",
  maxCalls: 5,
  temperature: 0.3,
});

const MODEL = aModel({
  id: "model-1",
  title: "deepseek-v4-flash",
  provider: "openrouter",
  inputPrice: 3,
  outputPrice: 15,
  answerCeiling: 4_096,
  contextCeiling: 700_000,
});

/** What the main process says one turn came to. */
function said(patch: Record<string, unknown> = {}) {
  return {
    text: "Готово.",
    isStopped: false,
    isCallsExhausted: false,
    isCeilingHit: false,
    inputTokens: 1_000,
    outputTokens: 200,
    calls: [],
    ...patch,
  };
}

function machine(answer: unknown) {
  const invoke = vi.fn(async () => answer);

  standInBridge({
    invoke,
  });

  return invoke;
}

function refusingMachine(failure: string) {
  const invoke = vi.fn(async () => {
    throw new Error(`Error invoking remote method 'llm:ask': Error: ${failure}`);
  });

  standInBridge({
    invoke,
  });

  return invoke;
}

/** One turn as asked, with the case's fields patched in. */
/** A project that declares nothing: neither a command nor a server. */
const NOTHING_DECLARED: GrantTargets = {
  commands: [],
  servers: [],
  looks: {},
  agents: [],
};

function turn(patch: Partial<TurnToAsk> = {}): TurnToAsk {
  return {
    turnId: "turn-1",
    agent: AGENT,
    stands: {
      model: MODEL,
      provider: OPENROUTER,
      prompt: null,
    },
    asked: "Розбий текст на тези",
    thread: [],
    catalogue: NOTHING_DECLARED,
    agents: [],
    directory: "/tmp/coder",
    ...patch,
  };
}

/** The turn as it is asked when nothing stands in its way. */
function ask(asked = "Розбий текст на тези") {
  return answerTurn(
    turn({
      asked,
    }),
  );
}

describe("answerTurn · before the model is troubled", () => {
  it("does not ask the machine at all when a wall stands before the turn", async () => {
    // Walls belong to the walk and are met before the model is asked.
    const invoke = machine(said());
    const answer = await answerTurn(
      turn({
        asked: "Розбий текст",
        agent: anAgent({
          promptId: "prompt-gone",
        }),
      }),
    );

    expect(invoke).not.toHaveBeenCalled();
    expect(answer.notStarted).toBe("lostPrompt");
    expect(answer.isFailure).toBe(false);
  });

  it("carries the turn's own numbers and the person's words to the machine", async () => {
    const invoke = machine(said());

    await answerTurn(
      turn({
        asked: "Розбий текст",
        stands: {
          model: MODEL,
          provider: OPENROUTER,
          prompt: aPrompt(),
        },
      }),
    );

    expect(invoke).toHaveBeenCalledWith(ASK_AGENT_CHANNEL, {
      turnId: "turn-1",
      agentId: "agent-1",
      providerId: "openrouter",
      model: "deepseek-v4-flash",
      directory: "/tmp/coder",
      maxCalls: 5,
      temperature: 0.3,
      answerCeiling: 4_096,
      systemPrompt: "Знайди що просять.",
      // A turn carries the prompt and what was asked, nothing more.
      messages: [
        {
          from: "person",
          text: "Розбий текст",
        },
      ],
      tools: [],
      // Every declared server's reach rides along, so a granted function finds its server by id.
      servers: [],
      agents: [],
    });
  });
});

describe("answerTurn · what comes back", () => {
  it("gives the model's own words, what it cost and the end it came to", async () => {
    machine(said());

    const answer = await ask();

    expect(answer.text).toBe("Готово.");
    expect(answer.note).toBeNull();
    expect(answer.state).toBe(RUN_STEP_DONE);
    expect(answer.isCut).toBe(false);
    expect(answer.isFailure).toBe(false);
    expect(answer.cost).toMatchObject({
      inputTokens: 1_000,
      outputTokens: 200,
    });
    expect(answer.answerCeiling).toBe(4_096);
  });

  it("says the app's own word about a turn that ended without the agent saying its piece", async () => {
    // The app's note stands apart; the cut turn's text is not turned into an answer.
    machine(
      said({
        isStopped: true,
      }),
    );

    const answer = await ask();

    expect(answer.isCut).toBe(true);
    expect(answer.note).not.toBeNull();
    expect(answer.state).not.toBe(RUN_STEP_DONE);
  });

  it("reads a refusal at the door as a turn that never began, not as a fall", async () => {
    // The main process refused before trying, so nothing failed.
    refusingMachine(LLM_NO_KEY);

    const answer = await ask();

    expect(answer.notStarted).toBe("noKey");
    expect(answer.isFailure).toBe(false);
    // The sentence is the card's own text, since there are no model words.
    expect(answer.text).toContain("deepseek-v4-flash");
    expect(answer.text).toContain("OpenRouter");
    expect(answer.note).toBeNull();
  });

  it("reads any other fall as a fall, and brings nothing back from it", async () => {
    // The agent wears «упав» until one of its turns succeeds; calls run before the fall are lost.
    refusingMachine("socket hang up");

    const answer = await ask();

    expect(answer.isFailure).toBe(true);
    expect(answer.notStarted).toBeNull();
    expect(answer.state).toBe(RUN_STEP_FAILED);
    expect(answer.cost).toBeNull();
    expect(answer.calls).toEqual([]);
  });

  it("brings the provider's own sentence back with the fall, on the rule and for the record", async () => {
    // A fall that only says it fell sends the person to a terminal to learn why.
    refusingMachine("404 page not found");

    const answer = await ask();

    expect(answer.note).toBe(fellNote("404 page not found"));
    expect(answer.fell).toBe("404 page not found");
    // The sentence is not the agent speaking, so no card is made of it.
    expect(answer.text).toBe("");
  });
});

describe("stopTurn", () => {
  it("ends the turn by its own id", async () => {
    const invoke = machine(undefined);

    await stopTurn("turn-1");

    expect(invoke).toHaveBeenCalledWith(STOP_AGENT_CHANNEL, {
      turnId: "turn-1",
    });
  });

  it("says nothing about a turn the machine no longer has", async () => {
    // Stopping a turn that already returned is not an error to show.
    refusingMachine("no such turn");

    expect(await stopTurn("turn-1")).toBeUndefined();
  });
});
