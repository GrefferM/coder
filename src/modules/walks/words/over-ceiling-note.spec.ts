import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { overCeilingNote, reservedNote } from "./over-ceiling-note";
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

describe("reservedNote", () => {
  it("says how long the words are, what is held back for the memory, and the threshold they must stay under", () => {
    assert.equal(
      reservedNote(
        "claude-sonnet-4.5",
        {
          prompt: 500,
          asked: 7_600,
          memory: 0,
          total: 8_100,
          ceiling: 10_000,
        },
        1_000,
        9_000,
      ),
      "Промпт і питання — 8 100 символів, і ще 1 000 зарезервовано під пам'ять агента, а поріг стиснення — 9 000 (стеля claude-sonnet-4.5 — 10000). Разом вони мають лишатися нижче порогу, інакше щойно стиснута пам'ять стискалась би знову на наступному ході. Хід не почався: нічого не обрізали й нічого не викинули.",
    );
  });
});
