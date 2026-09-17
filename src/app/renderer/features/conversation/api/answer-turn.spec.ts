import { describe, expect, it, vi } from "vitest";
import { answerTurn, stopTurn } from "./answer-turn";
import type { TurnCatalogue, TurnToAsk } from "../interfaces";
import { ASK_AGENT_CHANNEL, STOP_AGENT_CHANNEL } from "../../../../../contracts";
import { LLM_NO_KEY } from "../constants";
import { RUN_STEP_DONE, RUN_STEP_FAILED } from "../../record";
import { aModel, aPrompt, anAgent, standInBridge } from "../../../testing";
import type { ProviderState } from "../../../interfaces";

const OPENROUTER: ProviderState = {
  id: "openrouter",
  name: "OpenRouter",
  kind: "remote",
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

/** One turn as it is asked, with what the case is about patched into it. */
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

/** A project that declares nothing: neither a command nor a server. */
const NOTHING_DECLARED: TurnCatalogue = {
  commands: [],
  servers: [],
  looks: {},
};

describe("answerTurn · before the model is troubled", () => {
  it("does not ask the machine at all when a wall stands before the turn", async () => {
    // Every wall is the walk's own, so it is met here and the model never hears about it.
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
      providerId: "openrouter",
      model: "deepseek-v4-flash",
      directory: "/tmp/coder",
      maxCalls: 5,
      temperature: 0.3,
      answerCeiling: 4_096,
      systemPrompt: "Знайди що просять.",
      // A turn carries the prompt and what was asked, and nothing standing behind it.
      messages: [
        {
          from: "person",
          text: "Розбий текст",
        },
      ],
      tools: [],
      // The reach of every declared server rides along, so a granted function finds its own by id.
      servers: [],
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
    // The note is ours and stands apart; the cut turn's own text is not made into an answer.
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
    // The main process refused before anything was tried — nothing was tried, so nothing failed.
    refusingMachine(LLM_NO_KEY);

    const answer = await ask();

    expect(answer.notStarted).toBe("noKey");
    expect(answer.isFailure).toBe(false);
    // The sentence stands as the card's own text and not as a note beside it: there are no words of the model to
    // stand beside, so the card is the sentence.
    expect(answer.text).toContain("deepseek-v4-flash");
    expect(answer.text).toContain("OpenRouter");
    expect(answer.note).toBeNull();
  });

  it("reads any other fall as a fall, and brings nothing back from it", async () => {
    // The agent wears «упав» until one of its own goes through; what it ran before the fall is lost.
    refusingMachine("socket hang up");

    const answer = await ask();

    expect(answer.isFailure).toBe(true);
    expect(answer.notStarted).toBeNull();
    expect(answer.state).toBe(RUN_STEP_FAILED);
    expect(answer.cost).toBeNull();
    expect(answer.calls).toEqual([]);
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
    // Stopping what has already come back is not an error to show anyone.
    refusingMachine("no such turn");

    expect(await stopTurn("turn-1")).toBeUndefined();
  });
});
