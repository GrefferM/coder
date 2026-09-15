import { describe, expect, it } from "vitest";
import { answerCeilingNote } from "./answer-ceiling-note";

describe("answerCeilingNote", () => {
  it("names the ceiling the provider was given, in the tokens it is written in", () => {
    expect(answerCeilingNote(4096)).toBe("Відповідь уперлася в стелю · 4096 ткн");
  });

  it("leaves a long number as the person wrote it, since that is what went to the provider", () => {
    expect(answerCeilingNote(16_000)).toBe("Відповідь уперлася в стелю · 16000 ткн");
  });

  it("says itself without the number where the step carried none, keeping the unit in its place", () => {
    expect(answerCeilingNote(null)).toBe("Відповідь уперлася в стелю · — ткн");
  });
});
