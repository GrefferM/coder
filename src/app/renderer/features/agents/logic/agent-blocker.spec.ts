import { describe, expect, it } from "vitest";
import { agentBlocked } from "./agent-blocker";
import { AGENT_MAX_CALLS_DROPPED_LABEL, AGENT_NAME_DROPPED_LABEL, AGENT_TEMPERATURE_DROPPED_LABEL } from "../constants";
import type { AgentDraft } from "../interfaces";
import { aDraft } from "../../../testing";

function draft(name: string, patch: Partial<AgentDraft> = {}): AgentDraft {
  return aDraft({
    name,
    color: "#b18aff",
    ...patch,
  });
}

describe("agentBlocked", () => {
  it("blocks the write on an empty name, since the name is the one field a person can empty", () => {
    expect(agentBlocked(draft(""))).toEqual([AGENT_NAME_DROPPED_LABEL]);
  });

  it("counts a name of spaces as no name at all", () => {
    expect(agentBlocked(draft("   "))).toEqual([AGENT_NAME_DROPPED_LABEL]);
  });

  it("blocks the write while one of the two numbers is empty, naming each in the tab’s own order", () => {
    expect(
      agentBlocked(
        draft("ТЕЗАР", {
          maxCalls: null,
          temperature: null,
        }),
      ),
    ).toEqual([AGENT_MAX_CALLS_DROPPED_LABEL, AGENT_TEMPERATURE_DROPPED_LABEL]);
  });

  it("counts a temperature of nothing as written, since zero is a number the person chose", () => {
    expect(agentBlocked(draft("ТЕЗАР"))).toEqual([]);
  });

  it("blocks nothing where the name stands and both numbers are written", () => {
    expect(agentBlocked(draft("ТЕЗАР"))).toEqual([]);
  });
});
