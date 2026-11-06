import { describe, expect, it } from "vitest";
import { spokenText } from "./spoken-text";

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
