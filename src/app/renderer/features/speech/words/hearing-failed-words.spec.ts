import { describe, expect, it } from "vitest";
import { hearingFailedWords } from "./hearing-failed-words";

describe("hearingFailedWords", () => {
  it("names the provider, then hands on its own sentence", () => {
    expect(hearingFailedWords("OpenAI", "Incorrect API key provided")).toBe(
      "OpenAI не розпізнав: Incorrect API key provided",
    );
  });
});
