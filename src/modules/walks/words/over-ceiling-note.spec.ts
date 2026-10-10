import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { overCeilingNote } from "./over-ceiling-note";
import type { TurnLength } from "../../../contracts";

const length = (total: number, ceiling: number): TurnLength => ({
  prompt: 0,
  asked: total,
  memory: 0,
  total,
  ceiling,
});

describe("overCeilingNote", () => {
  it("groups what we counted and leaves the ceiling as the person wrote it", () => {
    // Our length reads as a number; the ceiling is the person's field and goes out as is.
    assert.equal(
      overCeilingNote("claude-sonnet-4.5", length(214800, 200000)),
      "У модель пішло б 214 800 символів, а стеля claude-sonnet-4.5 — 200000. Хід не почався: нічого не обрізали й нічого не викинули.",
    );
  });

  it("counts the characters in Ukrainian, not in one form for every number", () => {
    assert.ok(overCeilingNote("m", length(21, 20)).includes("21 символ,"));
    assert.ok(overCeilingNote("m", length(22, 20)).includes("22 символи,"));
  });
});
