import { describe, expect, it } from "vitest";
import { scheduleRowState } from "./schedule-row-state";
import type { ProjectSchedule, ScheduleStanding } from "../../../interfaces";

const ON: ProjectSchedule = {
  id: "schedule-1",
  agentId: "agent-1",
  task: "Перевір main.",
  everyMinutes: 15,
  isActive: true,
};
const OFF: ProjectSchedule = {
  ...ON,
  isActive: false,
};
const COUNTING: ScheduleStanding = {
  scheduleId: "schedule-1",
  nextAt: 1_000,
  outSince: null,
};

describe("scheduleRowState", () => {
  it("says the trouble, not the switch, of a schedule that cannot run", () => {
    expect(
      scheduleRowState(
        ON,
        {
          kind: "agentGone",
        },
        COUNTING,
      ),
    ).toBe("agentGone");
    expect(
      scheduleRowState(
        ON,
        {
          kind: "unfilled",
          field: "ЗАВДАННЯ",
        },
        COUNTING,
      ),
    ).toBe("unfilled");
  });

  it("says a task is out before it says the switch", () => {
    expect(
      scheduleRowState(ON, null, {
        ...COUNTING,
        outSince: 500,
      }),
    ).toBe("out");
  });

  it("says the switch the schedule's file holds", () => {
    expect(scheduleRowState(ON, null, COUNTING)).toBe("on");
    expect(scheduleRowState(OFF, null, null)).toBe("off");
  });
});
