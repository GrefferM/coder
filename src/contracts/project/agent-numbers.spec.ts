import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { agentNumbers, isAgentFilled } from "./agent-numbers";
import { anAgent } from "../testing";
import type { Agent } from "./agent.interface";

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
    assert.deepEqual(
      agentNumbers(agent()).map(([, field]) => field),
      ["МАКСИМУМ ВИКЛИКІВ", "ТЕМПЕРАТУРА"],
    );
  });
});

describe("isAgentFilled", () => {
  it("takes an agent whose both numbers are written", () => {
    assert.equal(isAgentFilled(agent()), true);
  });

  it("takes a temperature of nothing as written, since zero is the end of the row the person chose", () => {
    assert.equal(
      isAgentFilled(
        agent({
          temperature: 0,
        }),
      ),
      true,
    );
  });

  it("refuses an agent whose file never carried one of them", () => {
    assert.equal(
      isAgentFilled(
        agent({
          maxCalls: null,
        }),
      ),
      false,
    );
    assert.equal(
      isAgentFilled(
        agent({
          temperature: null,
        }),
      ),
      false,
    );
  });
});
