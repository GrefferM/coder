import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseAgentArgs } from "./parse-agent-args";

describe("parseAgentArgs", () => {
  it("reads the project, the agent and the quoted question", () => {
    assert.deepEqual(parseAgentArgs(["Coder", "Редактор", "Що з цим робити?"]), {
      project: "Coder",
      agent: "Редактор",
      question: "Що з цим робити?",
    });
  });

  it("joins the words left after the agent into the question when it was not quoted", () => {
    assert.equal(parseAgentArgs(["Coder", "Редактор", "Що", "з", "цим?"]).question, "Що з цим?");
  });

  it("asks for all three where one is missing or says nothing", () => {
    assert.throws(() => parseAgentArgs([]), /Використання: npm run agent/);
    assert.throws(() => parseAgentArgs(["Coder", "Редактор"]), /Використання/);
    assert.throws(() => parseAgentArgs(["Coder", "   ", "питання"]), /Використання/);
    assert.throws(() => parseAgentArgs(["Coder", "Редактор", "  "]), /Використання/);
  });
});
