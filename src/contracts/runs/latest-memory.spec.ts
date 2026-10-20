import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { latestMemory } from "./latest-memory";
import type { WholeMemory } from "./whole-memory.interface";

function memory(patch: Partial<WholeMemory> = {}): WholeMemory {
  return {
    id: "memory-1",
    stepId: "step-1",
    stepPlace: 3,
    agentId: "agent-1",
    questionId: null,
    coversPlace: 2,
    text: "Зміст",
    lengthBefore: 900,
    lengthAfter: 100,
    compressAt: 90,
    compressTo: 10,
    inputTokens: 400,
    outputTokens: 50,
    money: 0.001,
    ...patch,
  };
}

describe("latestMemory", () => {
  it("is null while no compression was written", () => {
    assert.equal(latestMemory([], "agent-1", null), null);
  });

  it("takes the compression paid in the latest step, since it stands for the earlier one and what came after", () => {
    const later = memory({
      id: "later",
      stepPlace: 9,
      coversPlace: 8,
    });

    assert.equal(
      latestMemory(
        [
          later,
          memory(),
          memory({
            id: "middle",
            stepPlace: 6,
          }),
        ],
        "agent-1",
        null,
      ),
      later,
    );
  });

  it("keeps each agent's own thread apart from every other's", () => {
    const other = memory({
      id: "other",
      agentId: "agent-2",
      stepPlace: 9,
    });

    assert.equal(latestMemory([memory(), other], "agent-1", null)?.id, "memory-1");
    assert.equal(latestMemory([memory(), other], "agent-2", null)?.id, "other");
  });

  it("keeps an own thread apart from a shared memory, and one question's from another's", () => {
    const shared = memory({
      id: "shared",
      questionId: "question-1",
      stepPlace: 9,
    });
    const another = memory({
      id: "another",
      questionId: "question-2",
      stepPlace: 10,
    });
    const all = [memory(), shared, another];

    assert.equal(latestMemory(all, "agent-1", null)?.id, "memory-1");
    assert.equal(latestMemory(all, "agent-1", "question-1")?.id, "shared");
    assert.equal(latestMemory(all, "agent-1", "question-3"), null);
  });
});
