import { describe, expect, it } from "vitest";
import { deletedAgentLabel } from "./deleted-agent-label";

describe("deletedAgentLabel", () => {
  it("says only that the agent went when nothing else did", () => {
    expect(deletedAgentLabel(0)).toBe("АГЕНТА ВИДАЛЕНО");
  });

  it("counts the links that went with it, in the form the count takes", () => {
    expect(deletedAgentLabel(2)).toBe("АГЕНТА ВИДАЛЕНО · 2 ЗВ'ЯЗКИ ПРИБРАНО");
    expect(deletedAgentLabel(1)).toBe("АГЕНТА ВИДАЛЕНО · 1 ЗВ'ЯЗОК ПРИБРАНО");
    expect(deletedAgentLabel(5)).toBe("АГЕНТА ВИДАЛЕНО · 5 ЗВ'ЯЗКІВ ПРИБРАНО");
  });
});
