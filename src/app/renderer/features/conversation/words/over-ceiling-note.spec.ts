import { describe, expect, it } from "vitest";
import { overCeilingNote } from "./over-ceiling-note";
import type { TurnLength } from "../interfaces";

const length = (total: number, ceiling: number): TurnLength => ({
  prompt: 0,
  asked: total,
  total,
  ceiling,
});

describe("overCeilingNote", () => {
  it("groups what we counted and leaves the ceiling as the person wrote it", () => {
    // Our length reads as a number; the ceiling is the person's field and goes out as is.
    expect(overCeilingNote("claude-sonnet-4.5", length(214800, 200000))).toBe(
      "У модель пішло б 214 800 символів, а стеля claude-sonnet-4.5 — 200000. Хід не почався: нічого не обрізали й нічого не викинули.",
    );
  });

  it("counts the characters in Ukrainian, not in one form for every number", () => {
    expect(overCeilingNote("m", length(21, 20))).toContain("21 символ,");
    expect(overCeilingNote("m", length(22, 20))).toContain("22 символи,");
  });
});
