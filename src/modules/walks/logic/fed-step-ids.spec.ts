import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fedStepIds } from "./fed-step-ids";
import type { IncomingWork, RunLedger } from "../../../contracts";

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
    assert.deepEqual(
      fedStepIds(null, [
        work({
          fromAgentId: "agent-1",
        }),
      ]),
      [],
    );
  });

  it("names the supplier's own last step in this walk", () => {
    assert.deepEqual(
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
      ["step-1"],
    );
  });

  it("keeps the steps the record already names, and does not look them up again", () => {
    // A walk picked up from the record carries the steps it grew from.
    assert.deepEqual(
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
      ["step-written"],
    );
  });

  it("names nothing for a person's question, which came from no agent", () => {
    assert.deepEqual(fedStepIds(ledger(), [work()]), []);
  });

  it("names nothing for a supplier that has written no step in this walk yet", () => {
    assert.deepEqual(
      fedStepIds(ledger(), [
        work({
          fromAgentId: "agent-1",
        }),
      ]),
      [],
    );
  });

  it("names every feed of a converging point, in the order the work came", () => {
    assert.deepEqual(
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
      ["step-1", "step-2"],
    );
  });
});
