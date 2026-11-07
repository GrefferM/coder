import { describe, expect, it } from "vitest";
import { scheduleTrouble } from "./schedule-trouble";
import { anAgent } from "../../../testing";
import type { ProjectSchedule } from "../../../interfaces";

const AGENTS = [
  anAgent({
    id: "agent-1",
  }),
];

function aSchedule(patch: Partial<ProjectSchedule> = {}): ProjectSchedule {
  return {
    id: "schedule-1",
    agentId: "agent-1",
    task: "Перевір main.",
    everyMinutes: 15,
    ...patch,
  };
}

describe("scheduleTrouble", () => {
  it("finds nothing wrong with a schedule written whole whose agent stands", () => {
    expect(scheduleTrouble(aSchedule(), AGENTS)).toBeNull();
  });

  it("says the agent is gone where it points at one the project no longer holds", () => {
    expect(
      scheduleTrouble(
        aSchedule({
          agentId: "agent-gone",
          task: null,
        }),
        AGENTS,
      ),
    ).toEqual({
      kind: "agentGone",
    });
  });

  it("names the first field not written, in the form's order", () => {
    expect(
      scheduleTrouble(
        aSchedule({
          task: null,
          everyMinutes: null,
        }),
        AGENTS,
      ),
    ).toEqual({
      kind: "unfilled",
      field: "ЗАВДАННЯ",
    });
    expect(
      scheduleTrouble(
        aSchedule({
          agentId: null,
        }),
        AGENTS,
      ),
    ).toEqual({
      kind: "unfilled",
      field: "АГЕНТ",
    });
  });
});
