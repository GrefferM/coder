import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { answerCeilingNote } from "./answer-ceiling-note";

describe("answerCeilingNote", () => {
  it("names the ceiling the provider was given, in the tokens it is written in", () => {
    assert.equal(answerCeilingNote(4096), "Відповідь уперлася в стелю · 4096 ткн");
  });

  it("leaves a long number as the person wrote it, since that is what went to the provider", () => {
    assert.equal(answerCeilingNote(16_000), "Відповідь уперлася в стелю · 16000 ткн");
  });

  it("says itself without the number where the step carried none, keeping the unit in its place", () => {
    assert.equal(answerCeilingNote(null), "Відповідь уперлася в стелю · — ткн");
  });
});
