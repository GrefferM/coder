import { describe, expect, it } from "vitest";
import { callOut } from "./call-out";
import type { CallOut, WorkingAgent } from "../../../interfaces";

function held(turnId: string, agentId: string): WorkingAgent {
  return {
    turnId,
    agentId,
    startedAt: 0,
    questionId: "question-1",
    askedAt: 0,
  };
}

function command(name: string): CallOut {
  return {
    name,
    source: "command",
  };
}

describe("callOut", () => {
  it("says nothing where the agent is not working at all", () => {
    expect(
      callOut(
        [],
        {
          "turn-1": command("run_test"),
        },
        "agent-1",
      ),
    ).toBeNull();
  });

  it("says nothing where the turn is calling nobody", () => {
    expect(callOut([held("turn-1", "agent-1")], {}, "agent-1")).toBeNull();
  });

  it("says what this agent's turn has out, and which порода it came from", () => {
    expect(
      callOut(
        [held("turn-1", "agent-1")],
        {
          "turn-1": command("run_test"),
        },
        "agent-1",
      ),
    ).toEqual(command("run_test"));
  });

  it("reads the same turn the work pill wears where an agent holds several at once", () => {
    // The rows stand oldest first, and the sphere is no list of works.
    const working = [held("turn-1", "agent-1"), held("turn-2", "agent-1")];

    expect(
      callOut(
        working,
        {
          "turn-2": command("run_lint"),
        },
        "agent-1",
      ),
    ).toBeNull();
    expect(
      callOut(
        working,
        {
          "turn-1": command("run_test"),
          "turn-2": command("run_lint"),
        },
        "agent-1",
      ),
    ).toEqual(command("run_test"));
  });
});
