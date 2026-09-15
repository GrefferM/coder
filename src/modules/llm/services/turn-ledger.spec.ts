import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TurnLedger } from "./turn-ledger.service";
import type { TurnCall } from "../interfaces";

function aCall(id: string): TurnCall {
  return {
    id,
    name: "run_tests",
    arguments: {},
    pinned: [],
    line: "npm test",
    output: "",
    refusal: "",
    exitCode: 0,
    serverId: null,
    serverName: "",
    isFailed: false,
    startedAt: 1,
    endedAt: 2,
  };
}

describe("TurnLedger", () => {
  it("answers with nothing said and nothing spent before the turn begins", () => {
    assert.deepEqual(new TurnLedger().answer(), {
      text: "",
      isStopped: false,
      isCallsExhausted: false,
      isCeilingHit: false,
      inputTokens: 0,
      outputTokens: 0,
      calls: [],
    });
  });

  it("joins the pieces as they arrive and adds up what the provider counted for them", () => {
    const ledger = new TurnLedger();

    ledger.heard("Пер", 10, 1);
    ledger.heard("ша ", 0, 2);
    ledger.heard("теза.", 0, 3);

    const answer = ledger.answer();

    assert.equal(answer.text, "Перша теза.");
    assert.equal(answer.inputTokens, 10);
    assert.equal(answer.outputTokens, 6);
  });

  it("keeps every call in the order the turn made it", () => {
    const ledger = new TurnLedger();

    ledger.ran(aCall("one"));
    ledger.ran(aCall("two"));

    assert.deepEqual(
      ledger.answer().calls.map((call) => call.id),
      ["one", "two"],
    );
  });

  it("counts a round of the model and a tool run the same, and says when they are spent", () => {
    const ledger = new TurnLedger();

    assert.equal(ledger.isSpent(2), false);
    ledger.spend();
    assert.equal(ledger.isSpent(2), false);
    ledger.spend();
    assert.equal(ledger.isSpent(2), true);
  });

  it("says beforehand when this many more calls would take the turn past its maximum", () => {
    const ledger = new TurnLedger();

    ledger.spend();

    assert.equal(ledger.wouldOverspend(2, 3), false);
    assert.equal(ledger.wouldOverspend(3, 3), true);
  });

  it("keeps the words and the calls at every end, since a turn cut short still spent what it spent", () => {
    const ledger = new TurnLedger();

    ledger.heard("половина відпо", 5, 4);
    ledger.ran(aCall("one"));

    const ends = [
      {
        isStopped: true,
      },
      {
        isCeilingHit: true,
      },
      {
        isCallsExhausted: true,
      },
    ];

    for (const end of ends) {
      const answer = ledger.answer(end);

      assert.equal(answer.text, "половина відпо");
      assert.equal(answer.outputTokens, 4);
      assert.equal(answer.calls.length, 1);
    }
  });

  it("names one end and no other", () => {
    const stopped = new TurnLedger().answer({
      isStopped: true,
    });

    assert.equal(stopped.isStopped, true);
    assert.equal(stopped.isCeilingHit, false);
    assert.equal(stopped.isCallsExhausted, false);
  });
});
