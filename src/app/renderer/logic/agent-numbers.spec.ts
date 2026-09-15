import { describe, expect, it } from "vitest";
import { agentNumbers, isAgentFilled } from "./agent-numbers";
import type { Agent } from "../interfaces";
import { anAgent } from "../testing";

function agent(patch: Partial<Agent> = {}): Agent {
  return anAgent({
    name: "ТЕЗАР",
    color: "#b18aff",
    x: 0,
    y: 0,
    temperature: 0.3,
    ...patch,
  });
}

describe("agentNumbers", () => {
  it("lists both numbers an agent must carry, in the order its settings tab asks for them", () => {
    expect(agentNumbers(agent()).map(([, field]) => field)).toEqual(["МАКСИМУМ ВИКЛИКІВ", "ТЕМПЕРАТУРА"]);
  });
});

describe("isAgentFilled", () => {
  it("takes an agent whose both numbers are written", () => {
    expect(isAgentFilled(agent())).toBe(true);
  });

  it("takes a temperature of nothing as written, since zero is the end of the row the person chose", () => {
    expect(
      isAgentFilled(
        agent({
          temperature: 0,
        }),
      ),
    ).toBe(true);
  });

  it("refuses an agent whose file never carried one of them", () => {
    expect(
      isAgentFilled(
        agent({
          maxCalls: null,
        }),
      ),
    ).toBe(false);
    expect(
      isAgentFilled(
        agent({
          temperature: null,
        }),
      ),
    ).toBe(false);
  });
});
