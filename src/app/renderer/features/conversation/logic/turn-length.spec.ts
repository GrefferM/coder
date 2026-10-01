import { describe, expect, it } from "vitest";
import { turnLength } from "./turn-length";

describe("turnLength", () => {
  it("counts the prompt, the question and the memory, and their sum", () => {
    expect(
      turnLength({
        systemPrompt: "абв",
        asked: "питання",
        memoryLength: 5,
        ceiling: 100,
      }),
    ).toEqual({
      prompt: 3,
      asked: 7,
      memory: 5,
      total: 15,
      ceiling: 100,
    });
  });

  it("counts an agent without a prompt as nothing, not as a hole", () => {
    expect(
      turnLength({
        systemPrompt: null,
        asked: "так",
        memoryLength: 0,
        ceiling: 100,
      }).prompt,
    ).toBe(0);
  });

  it("counts a character the person sees as one, however many code units it takes", () => {
    expect(
      turnLength({
        systemPrompt: null,
        asked: "🙂",
        memoryLength: 0,
        ceiling: 100,
      }).asked,
    ).toBe(1);
  });

  it("carries the model's own number through, so the card compares against what is written", () => {
    expect(
      turnLength({
        systemPrompt: null,
        asked: "",
        memoryLength: 0,
        ceiling: 20000,
      }).ceiling,
    ).toBe(20000);
  });
});
