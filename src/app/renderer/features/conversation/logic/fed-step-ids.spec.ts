import { describe, expect, it } from "vitest";
import { fedStepIds } from "./fed-step-ids";
import type { IncomingWork, RunLedger } from "../interfaces";

function ledger(stepIdOf: Record<string, string> = {}): RunLedger {
  return {
    walkId: "walk-1",
    askedAt: 0,
    runId: "run-1",
    questionId: "question-1",
    out: 0,
    stepIdOf,
    queue: Promise.resolve(),
  };
}

function work(patch: Partial<IncomingWork> = {}): IncomingWork {
  return {
    text: "Розбий текст на тези",
    cost: null,
    fromAgentId: null,
    fromStepIds: [],
    seconds: null,
    attached: [],
    ...patch,
  };
}

describe("fedStepIds", () => {
  it("names nothing where no row is open yet: there is nothing written to point at", () => {
    expect(
      fedStepIds(null, [
        work({
          fromAgentId: "agent-1",
        }),
      ]),
    ).toEqual([]);
  });

  it("names the supplier's own last step in this walk", () => {
    expect(
      fedStepIds(
        ledger({
          "agent-1": "step-1",
        }),
        [
          work({
            fromAgentId: "agent-1",
          }),
        ],
      ),
    ).toEqual(["step-1"]);
  });

  it("keeps the steps the record already names, and does not look them up again", () => {
    // A walk picked up from the record carries the steps it grew from.
    expect(
      fedStepIds(
        ledger({
          "agent-1": "step-later",
        }),
        [
          work({
            fromAgentId: "agent-1",
            fromStepIds: ["step-written"],
          }),
        ],
      ),
    ).toEqual(["step-written"]);
  });

  it("names nothing for a person's question, which came from no agent", () => {
    expect(fedStepIds(ledger(), [work()])).toEqual([]);
  });

  it("names nothing for a supplier that has written no step in this walk yet", () => {
    expect(
      fedStepIds(ledger(), [
        work({
          fromAgentId: "agent-1",
        }),
      ]),
    ).toEqual([]);
  });

  it("names every feed of a converging point, in the order the work came", () => {
    expect(
      fedStepIds(
        ledger({
          "agent-1": "step-1",
          "agent-2": "step-2",
        }),
        [
          work({
            fromAgentId: "agent-1",
          }),
          work({
            fromAgentId: "agent-2",
          }),
        ],
      ),
    ).toEqual(["step-1", "step-2"]);
  });
});
