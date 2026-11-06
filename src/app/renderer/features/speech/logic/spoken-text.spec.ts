import { describe, expect, it } from "vitest";
import { spokenParts, spokenText, spokenWord } from "./spoken-text";

describe("spokenText", () => {
  it("reads the words and leaves a fenced block out, a pause in its place", () => {
    expect(spokenText("Додав кеш.\n```ts\nconst cache = new TtlCache(60_000);\n```\nІ два тести.")).toBe(
      "Додав кеш.\n. \nІ два тести.",
    );
  });

  it("leaves out a block the answer never closed", () => {
    expect(spokenText("Ось код:\n```\nconst a = 1;")).toBe("Ось код:\n.");
  });

  it("reads an answer with no code as it was written", () => {
    expect(spokenText("Готово.")).toBe("Готово.");
  });
});

describe("spokenWord", () => {
  it("finds the word the voice reached in the card's own text, past the code it skipped", () => {
    const text = "Додав кеш.\n```ts\nconst a = 1;\n```\nІ два тести.";
    const parts = spokenParts(text);
    const word = spokenWord(parts, parts.spoken.indexOf("тести"));

    expect(word).not.toBeNull();
    expect(text.slice(word?.start, word?.end)).toBe("тести.");
  });

  it("says how much of the reading is behind the word", () => {
    const parts = spokenParts("один два");

    expect(spokenWord(parts, 5)?.ratio).toBeCloseTo(5 / 8);
  });

  it("lights nothing inside the pause that stands for code", () => {
    const text = "Ось:\n```\nconst a = 1;\n```";
    const parts = spokenParts(text);

    expect(spokenWord(parts, parts.spoken.length - 1)).toBeNull();
  });
});
