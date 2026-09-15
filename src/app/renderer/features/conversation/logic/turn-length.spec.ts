import { describe, expect, it } from "vitest";
import { turnLength } from "./turn-length";

describe("turnLength", () => {
  it("counts the prompt and the question, and their sum", () => {
    expect(turnLength("абв", "питання", 100)).toEqual({
      prompt: 3,
      asked: 7,
      total: 10,
      ceiling: 100,
    });
  });

  it("counts an agent without a prompt as nothing, not as a hole", () => {
    expect(turnLength(null, "так", 100).prompt).toBe(0);
  });

  it("counts a character the person sees as one, however many code units it takes", () => {
    expect(turnLength(null, "🙂", 100).asked).toBe(1);
  });

  it("carries the model's own number through, so the card compares against what is written", () => {
    expect(turnLength(null, "", 20000).ceiling).toBe(20000);
  });
});
