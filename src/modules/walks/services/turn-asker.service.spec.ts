import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TurnAsker } from "./turn-asker.service";
import { ScriptedLlm } from "../testing";
import {
  COMPOSER_MEMORY_OPENING,
  COMPOSER_SAID_NOTHING_NOTE,
  RUN_STEP_DONE,
  RUN_STEP_FAILED,
  RUN_STEP_STOPPED,
  composedMemory,
  composedSharedMemory,
  sharedMemoryWithTask,
  composerLength,
  composerWords,
  composerMessage,
  memoryText,
} from "../../../contracts";
import { aModel, anAgent } from "../../../utils/testing";
import type { MemoryFacts, SaidTurn, TurnMemory, TurnToAsk } from "../../../contracts";
import type { ModelAsk, ModelCompose, TurnLlm } from "../interfaces";

const CEILING = 100_000;

/** A turn whose model takes a hundred thousand characters and prices tokens at one unit per million each way. */
function turn(memory: TurnMemory, patch: Partial<TurnToAsk> = {}): TurnToAsk {
  return {
    turnId: "turn-1",
    agent: anAgent({
      compressAt: 90,
      compressTo: 10,
    }),
    stands: {
      model: aModel({
        title: "claude-sonnet-4.5",
        provider: "anthropic",
        inputPrice: 1,
        outputPrice: 1,
        contextCeiling: CEILING,
      }),
      provider: null,
      prompt: null,
    },
    asked: "Прогони тести",
    memory,
    catalogue: {
      commands: [],
      agents: [],
      servers: [],
      looks: {},
    },
    agents: [],
    followers: [],
    directory: "/tmp/coder",
    runId: "run-1",
    questionId: "question-1",
    ...patch,
  };
}

/** An own thread of one input of this many characters, read up to the third step of the run. */
function thread(length: number): TurnMemory {
  return {
    thread: [
      {
        from: "person",
        text: "а".repeat(length),
      },
    ],
    composed: "",
    shared: "",
    covers: 3,
  };
}

describe("TurnAsker", () => {
  it("asks a turn that fits as it stands, the composer never called", async () => {
    const llm = new ScriptedLlm({
      "agent-1": "Тести пройшли",
    });
    const answer = await new TurnAsker(llm).answer(turn(thread(100)));

    assert.equal(llm.composed.length, 0);
    assert.equal(answer.text, "Тести пройшли");
    assert.equal(answer.state, RUN_STEP_DONE);
    assert.equal(answer.compressed, null);
  });

  describe("a memory over the agent's threshold", () => {
    it("is read by the composer first, told the budget, then written down as one message the turn goes with", async () => {
      const llm = new ScriptedLlm(
        {
          "agent-1": "Тести пройшли",
        },
        "Зміст усього",
      );
      const answer = await new TurnAsker(llm).answer(turn(thread(91_000)));
      const [composing] = llm.composed;
      const [asking] = llm.asked;

      assert.equal(llm.composed.length, 1);
      // Ten thousand characters, ten percent of a hundred thousand, less what the memory is told in around the
      // message; told in words.
      const words = composerWords(10_000 - [...composedMemory("")].length);

      assert.equal(composing.answerCeiling, 4_096);
      // One message with no system prompt: the memory told by who said it, fenced in, then the instruction with the
      // words.
      assert.deepEqual(composing.messages, [
        {
          from: "person",
          text: composerMessage(memoryText(thread(91_000)), 10_000 - [...composedMemory("")].length),
        },
      ]);
      assert.ok(composing.messages[0].text.includes(`не більше ${words} слів`));
      // The turn goes with the message and its own words, and the old thread is not sent.
      assert.deepEqual(asking.messages, [
        {
          from: "person",
          text: `${composedMemory("Зміст усього")}Прогони тести`,
        },
      ]);
      assert.equal(answer.text, "Тести пройшли");
      assert.equal(answer.state, RUN_STEP_DONE);
    });

    it("is kept with the lengths, the place it covers and what the composer used, for the record to write", async () => {
      const llm = new ScriptedLlm({}, "Зміст усього");
      const answer = await new TurnAsker(llm).answer(turn(thread(91_000)));

      assert.deepEqual(answer.compressed, {
        facts: {
          agentId: "agent-1",
          questionId: null,
          coversPlace: 3,
          text: "Зміст усього",
          lengthBefore: 91_000,
          lengthAfter: 12,
          compressAt: 90,
          compressTo: 10,
          inputTokens: 20,
          outputTokens: 4,
          money: (20 + 4) / 1_000_000,
        },
        carried: [...composedMemory("Зміст усього")].length,
      });
    });

    it("costs the turn what the composer and the model used together", async () => {
      const llm = new ScriptedLlm({}, "Зміст усього");
      const answer = await new TurnAsker(llm).answer(turn(thread(91_000)));

      // The composer's 20 and 4, the model's 10 and 5.
      assert.equal(answer.cost?.inputTokens, 30);
      assert.equal(answer.cost?.outputTokens, 9);
    });

    it("is written down in the shared memory's own words for an agent that shares the question's memory", async () => {
      const llm = new ScriptedLlm({}, "Зміст усього");
      const asked = turn(
        {
          thread: [],
          composed: "",
          shared: "а".repeat(91_000),
          covers: 5,
        },
        {
          agent: anAgent({
            memory: "shared",
            compressAt: 90,
            compressTo: 10,
          }),
        },
      );
      const answer = await new TurnAsker(llm).answer(asked);

      assert.equal(
        llm.asked[0].messages[0].text,
        `${sharedMemoryWithTask(composedSharedMemory("Зміст усього"))}Прогони тести`,
      );
      assert.equal(answer.compressed?.facts.questionId, "question-1");
      assert.equal(answer.compressed?.facts.coversPlace, 5);
    });
  });

  describe("when the composer cannot write the message", () => {
    it("falls the turn with the provider's own sentence, the model never asked", async () => {
      const unwritten = new Error("Провайдер не відповів");
      const llm = new ScriptedLlm({}, unwritten);
      const answer = await new TurnAsker(llm).answer(turn(thread(91_000)));

      assert.equal(llm.asked.length, 0);
      assert.equal(answer.isFailure, true);
      assert.equal(answer.state, RUN_STEP_FAILED);
      assert.equal(answer.fell, "Провайдер не відповів");
      assert.equal(answer.compressed, null);
    });

    it("falls the turn when it comes back with nothing, since the memory cannot be dropped for it", async () => {
      const llm = new ScriptedLlm({}, "  ");
      const answer = await new TurnAsker(llm).answer(turn(thread(91_000)));

      assert.equal(llm.asked.length, 0);
      assert.equal(answer.state, RUN_STEP_FAILED);
      assert.equal(answer.fell, COMPOSER_SAID_NOTHING_NOTE);
    });

    it("ends the turn stopped, not fallen, when the person stopped it there, with no memory made of what was written", async () => {
      const stopped: TurnLlm = {
        async ask(_payload: ModelAsk): Promise<SaidTurn> {
          throw new Error("не мало бути");
        },
        async compose(_payload: ModelCompose): Promise<SaidTurn> {
          return {
            text: "Зміст, що не дописався",
            isStopped: true,
            isCallsExhausted: false,
            isCeilingHit: false,
            inputTokens: 20,
            outputTokens: 2,
            calls: [],
            called: null,
            memories: [],
            route: null,
          };
        },
        stop: () => undefined,
      };
      const answer = await new TurnAsker(stopped).answer(turn(thread(91_000)));

      assert.equal(answer.state, RUN_STEP_STOPPED);
      assert.equal(answer.text, "");
      assert.equal(answer.compressed, null);
      assert.equal(answer.cost?.inputTokens, 20);
    });
  });

  it("adds what the agents it called cost, their turns and their composers, to the step's cost, and hands the record only the memories it keeps", async () => {
    const kept: MemoryFacts = {
      agentId: "archivist",
      questionId: "question-1",
      coversPlace: 2,
      text: "Зміст питання",
      lengthBefore: 9_000,
      lengthAfter: 900,
      compressAt: 70,
      compressTo: 10,
      inputTokens: 100,
      outputTokens: 10,
      money: 0.001,
    };
    const llm: TurnLlm = {
      async ask(_payload: ModelAsk): Promise<SaidTurn> {
        return {
          text: "Готово",
          isStopped: false,
          isCallsExhausted: false,
          isCeilingHit: false,
          inputTokens: 10,
          outputTokens: 5,
          calls: [],
          // What the turns of the agents it called cost, theirs and those they called in turn.
          called: {
            inputTokens: 200,
            outputTokens: 20,
            money: 0.002,
          },
          memories: [
            {
              cost: {
                inputTokens: 100,
                outputTokens: 10,
                money: 0.001,
              },
              facts: kept,
            },
            {
              cost: {
                inputTokens: 50,
                outputTokens: 5,
                money: 0.0005,
              },
              facts: null,
            },
          ],
          route: null,
        };
      },
      async compose(_payload: ModelCompose): Promise<SaidTurn> {
        throw new Error("не мало бути");
      },
      stop: () => undefined,
    };
    const answer = await new TurnAsker(llm).answer(turn(thread(100)));

    assert.equal(answer.cost?.inputTokens, 360);
    assert.equal(answer.cost?.outputTokens, 40);
    assert.ok(Math.abs((answer.cost?.money ?? 0) - 0.003515) < 1e-12);
    assert.deepEqual(answer.toolMemories, [kept]);
    assert.equal(answer.compressed, null);
  });

  it("falls with the composer's message kept and its cost counted when the model fails after it", async () => {
    const llm = new ScriptedLlm(
      {
        "agent-1": new Error("Модель впала"),
      },
      "Зміст усього",
    );
    const answer = await new TurnAsker(llm).answer(turn(thread(91_000)));

    assert.equal(answer.state, RUN_STEP_FAILED);
    assert.equal(answer.fell, "Модель впала");
    assert.equal(answer.compressed?.facts.text, "Зміст усього");
    assert.equal(answer.cost?.inputTokens, 20);
  });

  it("compresses a memory even a few characters short of the ceiling, since it is never a wall", async () => {
    const llm = new ScriptedLlm({}, "Зміст усього");
    const answer = await new TurnAsker(llm).answer(turn(thread(98_000)));

    assert.equal(answer.notStarted, null);
    assert.equal(llm.composed.length, 1);
    assert.equal(answer.compressed?.facts.text, "Зміст усього");
  });

  it("has the composer read a memory too long for the ceiling from its newest end, in the room the ceiling leaves it", async () => {
    const llm = new ScriptedLlm(
      {
        "agent-1": "Готово",
      },
      "Зміст усього",
    );
    const long = {
      ...thread(0),
      thread: [
        {
          from: "person" as const,
          text: "а".repeat(10_000),
        },
        {
          from: "agent" as const,
          text: "б".repeat(150_000),
        },
      ],
    };
    const answer = await new TurnAsker(llm).answer(turn(long));
    const [composing] = llm.composed;
    const room = CEILING - composerLength(CEILING);

    assert.equal(answer.state, RUN_STEP_DONE);
    // The message is as long as the ceiling lets it be, and it is the newest of the memory that fills it.
    assert.equal(composing.messages.length, 1);
    assert.ok([...composing.messages[0].text].length <= CEILING);
    assert.ok(composing.messages[0].text.startsWith(`${COMPOSER_MEMORY_OPENING}${"б".repeat(room)}`));
    // What the record keeps is the whole memory the message stands for.
    assert.equal(answer.compressed?.facts.lengthBefore, 160_000);
  });

  it("cuts the end off a message that runs over its budget, so the most important of it stays", async () => {
    const llm = new ScriptedLlm({}, `${"головне ".repeat(100)}${"друге ".repeat(3_000)}`);
    const answer = await new TurnAsker(llm).answer(turn(thread(91_000)));
    const kept = answer.compressed?.facts.text ?? "";
    const budget = 10_000 - [...composedMemory("")].length;

    assert.ok([...kept].length <= budget);
    assert.ok(kept.startsWith("головне головне"));
    assert.ok(kept.endsWith("друге"));
    assert.equal(answer.compressed?.facts.lengthAfter, [...kept].length);
    assert.equal(llm.asked[0].messages[0].text, `${composedMemory(kept)}Прогони тести`);
  });

  it("falls the turn when what is left of the message after its budget is nothing", async () => {
    const llm = new ScriptedLlm({}, "\n\n");
    const answer = await new TurnAsker(llm).answer(turn(thread(91_000)));

    assert.equal(answer.fell, COMPOSER_SAID_NOTHING_NOTE);
  });
});
