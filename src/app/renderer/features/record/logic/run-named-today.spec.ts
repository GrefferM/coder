import { describe, expect, it } from "vitest";
import { runNamedToday } from "./run-named-today";
import { RUN_DONE } from "../constants";
import type { NamedAgent } from "../../../interfaces";
import type { WholeRun, WholeStep } from "../interfaces";
import { aStep } from "../../../testing";

const TODAY: NamedAgent[] = [
  {
    id: "agent-1",
    name: "Тезар 1",
    color: "#6fd3d8",
  },
];

function run(walk: WholeStep[]): WholeRun {
  return {
    id: "run-1",
    startedByAgentId: "agent-1",
    startedByAgentName: "ТЕЗАР",
    startedByAgentColor: "#b18aff",
    startedByScheduleId: null,
    askedAgentId: "agent-1",
    askedAgentName: "ТЕЗАР",
    asked: "Розбий текст на тези",
    state: RUN_DONE,
    startedAt: new Date("2026-08-22T19:26:56"),
    askedAt: new Date("2026-08-22T19:26:56"),
    endedAt: new Date("2026-08-22T19:27:12"),
    steps: walk.length,
    money: 0.02,
    worked: 5_000,
    questions: [],
    walk,
    memories: [],
  };
}

describe("runNamedToday", () => {
  it("puts today's name and colour on a step the record wrote under an older one", () => {
    const walked = aStep({
      agentName: "ТЕЗАР",
      agentColor: "#b18aff",
    });
    const [step] = runNamedToday(run([walked]), TODAY).walk;

    expect(step.agentName).toBe("Тезар 1");
    expect(step.agentColor).toBe("#6fd3d8");
  });

  it("renames the run's own row too", () => {
    const named = runNamedToday(run([]), TODAY);

    expect(named.startedByAgentName).toBe("Тезар 1");
    expect(named.startedByAgentColor).toBe("#6fd3d8");
  });

  it("keeps the record's name for an agent the project no longer has", () => {
    const walked = aStep({
      agentId: "agent-gone",
      agentName: "ТЕЗАР",
      agentColor: "#b18aff",
    });
    const [step] = runNamedToday(run([walked]), TODAY).walk;

    expect(step.agentName).toBe("ТЕЗАР");
    expect(step.agentColor).toBe("#b18aff");
  });

  it("leaves what the turn ran on and what it cost exactly as the record kept them", () => {
    const walked = aStep({
      model: "deepseek-v4-flash",
      prompt: "Ти ріжеш текст на тези.",
      inputPrice: 3,
      outputPrice: 15,
      money: 0.01,
    });
    const [step] = runNamedToday(run([walked]), TODAY).walk;

    expect(step.model).toBe("deepseek-v4-flash");
    expect(step.prompt).toBe("Ти ріжеш текст на тези.");
    expect(step.inputPrice).toBe(3);
    expect(step.outputPrice).toBe(15);
    expect(step.money).toBe(0.01);
  });
});
