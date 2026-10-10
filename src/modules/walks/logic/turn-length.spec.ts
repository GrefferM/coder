import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { turnLength } from "./turn-length";

describe("turnLength", () => {
  it("counts the prompt, the question and the memory, and their sum", () => {
    assert.deepEqual(
      turnLength({
        systemPrompt: "абв",
        asked: "питання",
        memoryLength: 5,
        ceiling: 100,
      }),
      {
        prompt: 3,
        asked: 7,
        memory: 5,
        total: 15,
        ceiling: 100,
      },
    );
  });

  it("counts an agent without a prompt as nothing, not as a hole", () => {
    assert.equal(
      turnLength({
        systemPrompt: null,
        asked: "так",
        memoryLength: 0,
        ceiling: 100,
      }).prompt,
      0,
    );
  });

  it("counts a character the person sees as one, however many code units it takes", () => {
    assert.equal(
      turnLength({
        systemPrompt: null,
        asked: "🙂",
        memoryLength: 0,
        ceiling: 100,
      }).asked,
      1,
    );
  });

  it("carries the model's own number through, so the card compares against what is written", () => {
    assert.equal(
      turnLength({
        systemPrompt: null,
        asked: "",
        memoryLength: 0,
        ceiling: 20000,
      }).ceiling,
      20000,
    );
  });
});
