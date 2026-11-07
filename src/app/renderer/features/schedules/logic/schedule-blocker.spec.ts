import { describe, expect, it } from "vitest";
import { scheduleBlocker } from "./schedule-blocker";
import {
  SCHEDULE_AGENT_DROPPED_LABEL,
  SCHEDULE_INTERVAL_DROPPED_LABEL,
  SCHEDULE_TASK_DROPPED_LABEL,
} from "../constants";

const FILLED = {
  agentId: "agent-1",
  task: "Перевір main.",
  everyMinutes: "15",
  isActive: false,
};

describe("scheduleBlocker", () => {
  it("stops nothing when the agent, the task and the interval are written", () => {
    expect(scheduleBlocker(FILLED)).toEqual([]);
  });

  it("names every field still missing, in the form's order", () => {
    expect(
      scheduleBlocker({
        agentId: null,
        task: "  ",
        everyMinutes: "",
        isActive: false,
      }),
    ).toEqual([SCHEDULE_AGENT_DROPPED_LABEL, SCHEDULE_TASK_DROPPED_LABEL, SCHEDULE_INTERVAL_DROPPED_LABEL]);
  });

  it("stops an interval under a minute as it stops an empty one", () => {
    expect(
      scheduleBlocker({
        ...FILLED,
        everyMinutes: "0",
        isActive: false,
      }),
    ).toEqual([SCHEDULE_INTERVAL_DROPPED_LABEL]);
  });
});
