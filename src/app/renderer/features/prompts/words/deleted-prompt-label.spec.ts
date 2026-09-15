import { describe, expect, it } from "vitest";
import { deletedPromptLabel } from "./deleted-prompt-label";

describe("deletedPromptLabel", () => {
  it("names the agents left without a prompt, since that is what comes back", () => {
    expect(deletedPromptLabel(3)).toBe("ПРОМПТ ВИДАЛЕНО · 3 АГЕНТИ БЕЗ ПРОМПТА");
    expect(deletedPromptLabel(1)).toBe("ПРОМПТ ВИДАЛЕНО · 1 АГЕНТ БЕЗ ПРОМПТА");
  });

  it("says only that it went when nobody wore it", () => {
    expect(deletedPromptLabel(0)).toBe("ПРОМПТ ВИДАЛЕНО");
  });
});
