import { describe, expect, it } from "vitest";
import { deletedPromptNote } from "./deleted-prompt-note";

describe("deletedPromptNote", () => {
  it("speaks of one agent in the singular, all the way through", () => {
    expect(deletedPromptNote("Правки коду", 1)).toBe(
      "Заберемо промпт «Правки коду». 1 агент на ньому лишиться на голій моделі.",
    );
  });

  it("counts the rest and speaks of them together", () => {
    expect(deletedPromptNote("Правки коду", 3)).toBe(
      "Заберемо промпт «Правки коду». 3 агенти на ньому лишаться на голій моделі.",
    );
  });

  it("takes the many form past four, as the language does", () => {
    expect(deletedPromptNote("Правки коду", 7)).toBe(
      "Заберемо промпт «Правки коду». 7 агентів на ньому лишаться на голій моделі.",
    );
  });

  it("says outright when a prompt is on nobody", () => {
    // With no agents, the second half says nothing goes with it.
    expect(deletedPromptNote("Правки коду", 0)).toBe(
      "Заберемо промпт «Правки коду». Його нікому не призначено — з ним не піде нічого.",
    );
  });
});
