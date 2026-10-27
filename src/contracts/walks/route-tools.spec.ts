import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { routeTools } from "./route-tools";

const TELLER = {
  agentId: "a1",
  name: "КОДЕР",
  purpose: "Пише код",
};

describe("routeTools", () => {
  it("gives nothing where no line leads anywhere, since there is then nothing to choose", () => {
    assert.deepEqual(routeTools([]), []);
  });

  it("gives pass_to and finish_here, both with the same options", () => {
    const [pass, finish] = routeTools([
      TELLER,
      {
        agentId: "a2",
        name: "ПЕРЕВІРНИК",
        purpose: null,
      },
    ]);

    assert.deepEqual(
      [pass.name, pass.action, pass.source, finish.name, finish.action, finish.source],
      ["pass_to", "passTo", "route", "finish_here", "finishHere", "route"],
    );
    assert.deepEqual(pass.options, [
      {
        agentId: "a1",
        label: "КОДЕР",
      },
      {
        agentId: "a2",
        label: "ПЕРЕВІРНИК",
      },
    ]);
    assert.deepEqual(finish.options, pass.options);
  });

  it("lists whom the answer may go to, each with what it is for where that is written", () => {
    const [pass] = routeTools([
      TELLER,
      {
        agentId: "a2",
        name: "ПЕРЕВІРНИК",
        purpose: "  ",
      },
    ]);

    assert.ok(pass.description.endsWith("\n- КОДЕР — Пише код\n- ПЕРЕВІРНИК"));
  });

  it("tells agents of one name apart by a number, so the word the model gives names one of them", () => {
    const [pass] = routeTools([
      TELLER,
      {
        ...TELLER,
        agentId: "a2",
      },
      {
        ...TELLER,
        agentId: "a3",
      },
    ]);

    assert.deepEqual(
      pass.options.map((option) => option.label),
      ["КОДЕР", "КОДЕР (2)", "КОДЕР (3)"],
    );
  });

  it("does not hand out a number an agent already wears as its name", () => {
    const [pass] = routeTools([
      {
        ...TELLER,
        agentId: "a1",
        name: "КОДЕР (2)",
      },
      {
        ...TELLER,
        agentId: "a2",
      },
      {
        ...TELLER,
        agentId: "a3",
      },
    ]);

    assert.deepEqual(
      pass.options.map((option) => option.label),
      ["КОДЕР (2)", "КОДЕР", "КОДЕР (3)"],
    );
  });
});
