import { describe, expect, it } from "vitest";
import { isPromptLost } from "./lost-prompt";
import type { ProjectPrompt } from "../../../interfaces";
import { aPrompt } from "../../../testing";

const PROMPTS: ProjectPrompt[] = [
  aPrompt({
    name: "Правки коду",
    file: "prompts/pravky-kodu.md",
    text: "Ти працюєш у наявному репозиторії.",
  }),
];

describe("isPromptLost", () => {
  it("says nothing is broken where the prompt is held", () => {
    expect(isPromptLost("prompt-1", PROMPTS)).toBe(false);
  });

  it("says the tie is broken where the project no longer holds that prompt", () => {
    expect(isPromptLost("prompt-2", PROMPTS)).toBe(true);
  });

  it("takes a promptless agent for a choice, not a loss", () => {
    expect(isPromptLost(null, [])).toBe(false);
  });
});
