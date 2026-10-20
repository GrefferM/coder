import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { threadAfterCall, toolMemoryFacts, toolThreadMemory } from "./tool-memory";
import { NO_MEMORY } from "../../../contracts";

describe("toolThreadMemory", () => {
  it("is no memory before the agent's first call of the turn", () => {
    assert.deepEqual(toolThreadMemory(null), NO_MEMORY);
  });

  it("is the thread and the composer's message the turn has kept for it", () => {
    assert.deepEqual(
      toolThreadMemory({
        thread: [
          {
            from: "person",
            text: "Перше",
          },
        ],
        composed: "СТИСЛО",
      }),
      {
        thread: [
          {
            from: "person",
            text: "Перше",
          },
        ],
        composed: "СТИСЛО",
        shared: "",
        covers: 0,
      },
    );
  });
});

describe("threadAfterCall", () => {
  it("adds what the agent was asked and what it said, and keeps the composer's message ahead of them", () => {
    assert.deepEqual(
      threadAfterCall(
        {
          thread: [],
          composed: "СТИСЛО",
        },
        "Друге",
        "Відповідь",
      ),
      {
        composed: "СТИСЛО",
        thread: [
          {
            from: "person",
            text: "Друге",
          },
          {
            from: "agent",
            text: "Відповідь",
          },
        ],
      },
    );
  });
});

describe("toolMemoryFacts", () => {
  it("keeps whose memory and of what question, the place it covers, the lengths, the numbers and the cost", () => {
    assert.deepEqual(
      toolMemoryFacts({
        agentId: "archivist",
        questionId: "question-1",
        read: {
          ...NO_MEMORY,
          shared: "а".repeat(900),
          covers: 4,
        },
        composed: {
          text: "Стисло",
          memory: NO_MEMORY,
        },
        compression: {
          at: 70,
          to: 10,
        },
        cost: {
          inputTokens: 100,
          outputTokens: 10,
          money: 0.001,
        },
      }),
      {
        agentId: "archivist",
        questionId: "question-1",
        coversPlace: 4,
        text: "Стисло",
        lengthBefore: 900,
        lengthAfter: 6,
        compressAt: 70,
        compressTo: 10,
        inputTokens: 100,
        outputTokens: 10,
        money: 0.001,
      },
    );
  });

  it("counts no tokens and names no money where the provider counted nothing", () => {
    const facts = toolMemoryFacts({
      agentId: "archivist",
      questionId: "question-1",
      read: NO_MEMORY,
      composed: {
        text: "Стисло",
        memory: NO_MEMORY,
      },
      compression: {
        at: 70,
        to: 10,
      },
      cost: null,
    });

    assert.equal(facts.inputTokens, 0);
    assert.equal(facts.money, null);
  });
});
