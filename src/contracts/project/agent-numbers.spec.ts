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
    compressAt: 90,
    compressTo: 10,
    ...patch,
  });
}

describe("agentNumbers", () => {
  it("lists the numbers an agent with a memory must carry, in the order its settings tab asks for them", () => {
    assert.deepEqual(
      agentNumbers(agent()).map(([, field]) => field),
      ["ПОРІГ СТИСНЕННЯ", "ЦІЛЬ СТИСНЕННЯ", "МАКСИМУМ ВИКЛИКІВ", "ТЕМПЕРАТУРА"],
    );
  });

  it("leaves the compression out for an agent whose memory is off, since it has nothing to compress", () => {
    assert.deepEqual(
      agentNumbers(
        agent({
          memory: "none",
        }),
      ).map(([, field]) => field),
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

  it("refuses an agent that keeps a memory but whose file never carried when or how far to compress it", () => {
    for (const memory of ["own", "shared"] as const) {
      assert.equal(
        isAgentFilled(
          agent({
            memory,
            compressAt: null,
          }),
        ),
        false,
      );
      assert.equal(
        isAgentFilled(
          agent({
            memory,
            compressTo: null,
          }),
        ),
        false,
      );
    }
  });

  it("takes an agent without a memory though it carries no compression", () => {
    assert.equal(
      isAgentFilled(
        agent({
          memory: "none",
          compressAt: null,
          compressTo: null,
        }),
      ),
      true,
    );
  });

  it("refuses an agent whose file never carried one of its two plain numbers", () => {
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
