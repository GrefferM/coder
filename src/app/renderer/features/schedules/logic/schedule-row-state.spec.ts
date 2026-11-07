import { describe, expect, it } from "vitest";
import { scheduleRowState } from "./schedule-row-state";
import type { ScheduleStanding } from "../../../interfaces";

const OFF: ScheduleStanding = {
  scheduleId: "schedule-1",
  isOn: false,
  nextAt: null,
  outSince: null,
};
const ON: ScheduleStanding = {
  ...OFF,
  isOn: true,
  nextAt: 1_000,
};

describe("scheduleRowState", () => {
  it("says the trouble, not the switch, of a schedule that cannot run", () => {
    expect(
      scheduleRowState(
        {
          kind: "agentGone",
        },
        ON,
      ),
    ).toBe("agentGone");
    expect(
      scheduleRowState(
        {
          kind: "unfilled",
          field: "ЗАВДАННЯ",
        },
        ON,
      ),
    ).toBe("unfilled");
  });

  it("says a task is out before it says the switch", () => {
    expect(
      scheduleRowState(null, {
        ...ON,
        outSince: 500,
      }),
    ).toBe("out");
  });

  it("says the switch of a schedule that can run", () => {
    expect(scheduleRowState(null, ON)).toBe("on");
    expect(scheduleRowState(null, OFF)).toBe("off");
  });

  it("stands off where the clock has not answered yet", () => {
    expect(scheduleRowState(null, null)).toBe("off");
  });
});
