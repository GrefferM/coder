import { describe, expect, it } from "vitest";
import { scheduleChanges } from "./schedule-changes";
import { anAgent } from "../../../testing";

const AGENTS = [
  anAgent({
    id: "agent-1",
    name: "NIGHTLY",
  }),
  anAgent({
    id: "agent-2",
    name: "REVIEWER",
  }),
];
const SAVED = {
  agentId: "agent-1",
  task: "Перевір main.",
  everyMinutes: "15",
  isActive: false,
};

describe("scheduleChanges", () => {
  it("finds nothing changed in a form as it was saved", () => {
    expect(scheduleChanges(SAVED, SAVED, AGENTS)).toEqual([]);
  });

  it("tells the switch in words", () => {
    expect(
      scheduleChanges(
        SAVED,
        {
          ...SAVED,
          isActive: true,
        },
        AGENTS,
      ),
    ).toEqual([
      {
        label: "стан",
        droppedLabel: "стан",
        was: "вимкнено",
        now: "увімкнено",
      },
    ]);
  });

  it("tells a changed agent by its name, and only the fields that moved", () => {
    expect(
      scheduleChanges(
        SAVED,
        {
          ...SAVED,
          agentId: "agent-2",
          everyMinutes: "30",
          isActive: false,
        },
        AGENTS,
      ),
    ).toEqual([
      {
        label: "агент",
        droppedLabel: "агента",
        was: "NIGHTLY",
        now: "REVIEWER",
      },
      {
        label: "інтервал",
        droppedLabel: "інтервал",
        was: "15",
        now: "30",
      },
    ]);
  });
});
