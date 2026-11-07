import { describe, expect, it } from "vitest";
import { stateLabel } from "./state-label";

describe("stateLabel", () => {
  it("says each state in its own word", () => {
    expect(stateLabel("out", null)).toBe("ІДЕ");
    expect(stateLabel("on", null)).toBe("УВІМКНЕНО");
    expect(stateLabel("off", null)).toBe("ВИМКНЕНО");
    expect(
      stateLabel("agentGone", {
        kind: "agentGone",
      }),
    ).toBe("НЕМА АГЕНТА");
  });

  it("names the field a schedule has not written", () => {
    expect(
      stateLabel("unfilled", {
        kind: "unfilled",
        field: "АГЕНТ",
      }),
    ).toBe("НЕ ЗАПОВНЕНО · АГЕНТ");
  });
});
