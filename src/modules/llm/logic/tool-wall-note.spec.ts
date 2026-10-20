import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toolWallNote } from "./tool-wall-note";
import type { TurnLength } from "../../../contracts";

const AGENT = {
  name: "archivist",
  model: "deepseek-v4-flash",
};

const length = (prompt: number, asked: number, memory: number, ceiling: number): TurnLength => ({
  prompt,
  asked,
  memory,
  total: prompt + asked + memory,
  ceiling,
});

describe("toolWallNote", () => {
  it("tells the words in Ukrainian with their count grouped, what is held back and the threshold, where a reserve is kept", () => {
    assert.equal(
      toolWallNote(AGENT, length(1_200, 3_801, 0, 10000), 1_000, 7_000),
      "[агент «archivist» не почав: його промпт і запит — 5 001 символ, і ще 1 000 зарезервовано під його пам'ять, а поріг стиснення — 7 000 (стеля моделі deepseek-v4-flash — 10000). Разом вони мають лишатися нижче порогу. Нічого не обрізали.]",
    );
  });

  it("counts the characters in the form their number asks for", () => {
    assert.ok(toolWallNote(AGENT, length(0, 22, 0, 100), 10, 70).includes("22 символи,"));
    assert.ok(toolWallNote(AGENT, length(0, 25, 0, 100), 10, 70).includes("25 символів,"));
  });

  it("tells what would have gone, part by part, against the ceiling, where nothing is held back", () => {
    assert.equal(
      toolWallNote(AGENT, length(13, 15, 4, 20), 0, 20),
      "[агент «archivist» не почав: у модель deepseek-v4-flash пішло б символів: 32 (промпт 13, пам'ять 4, запит 15), а стеля — 20. Нічого не обрізали.]",
    );
  });
});
