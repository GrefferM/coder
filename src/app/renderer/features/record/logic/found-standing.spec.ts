import { describe, expect, it } from "vitest";
import { foundStanding } from "./found-standing";
import { PERSON_COLOR, PERSON_NAME } from "../../../constants";
import type { NamedAgent } from "../../../interfaces";
import type { RunHit } from "../interfaces";

const TODAY: NamedAgent[] = [
  {
    id: "agent-2",
    name: "Тестер",
    color: "#6fd3d8",
  },
];

function hit(patch: Partial<RunHit> = {}): RunHit {
  return {
    runId: "run-1",
    questionId: "question-1",
    stepId: "step-2",
    agentId: "agent-2",
    agentName: "Тезар",
    step: 2,
    at: new Date("2026-09-07T14:12:00"),
    found: "Знайшов ялину.",
    isCall: false,
    ...patch,
  };
}

describe("foundStanding", () => {
  it("names the agent whose message this is, as they are called today", () => {
    // The record's name is «Тезар»; the list does not show it after a rename.
    expect(foundStanding(hit(), TODAY)).toEqual({
      name: "Тестер",
      color: "#6fd3d8",
      isGone: false,
    });
  });

  it("names an agent the project no longer holds from the record, and quietly", () => {
    expect(
      foundStanding(
        hit({
          agentId: "agent-9",
        }),
        TODAY,
      ),
    ).toEqual({
      name: "Тезар",
      color: null,
      isGone: true,
    });
  });

  it("signs a place standing in the question as the person's own, the way the stream signs it", () => {
    // The question is the person speaking, signed by no id.
    expect(
      foundStanding(
        hit({
          stepId: null,
          agentId: null,
          agentName: null,
          step: null,
        }),
        TODAY,
      ),
    ).toEqual({
      name: PERSON_NAME,
      color: PERSON_COLOR,
      isGone: false,
    });
  });

  it("names each place by its own message, so two steps of one run are not signed alike", () => {
    const first = foundStanding(
      hit({
        stepId: "step-1",
        agentId: "agent-2",
        agentName: "Тезар",
      }),
      TODAY,
    );
    const second = foundStanding(
      hit({
        stepId: "step-2",
        agentId: "agent-7",
        agentName: "Кодер",
      }),
      TODAY,
    );

    expect(first.name).toBe("Тестер");
    expect(second.name).toBe("Кодер");
  });
});
