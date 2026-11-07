import { describe, expect, it } from "vitest";
import { agentSchedulesNote } from "./agent-schedules-note";

describe("agentSchedulesNote", () => {
  it("says nothing of an agent with no schedules", () => {
    expect(agentSchedulesNote(0)).toBe("");
  });

  it("says one schedule in the singular", () => {
    expect(agentSchedulesNote(1)).toBe("Один її розклад лишиться без агента.");
  });

  it("says up to ten as a word, in the form the number takes", () => {
    expect(agentSchedulesNote(2)).toBe("Два її розклади лишаться без агента.");
    expect(agentSchedulesNote(5)).toBe("П'ять її розкладів лишаться без агента.");
  });

  it("says more than ten in figures", () => {
    expect(agentSchedulesNote(12)).toBe("12 її розкладів лишаться без агента.");
  });
});
