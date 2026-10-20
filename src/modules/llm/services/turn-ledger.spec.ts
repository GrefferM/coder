import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TurnLedger } from "./turn-ledger.service";
import type { TurnCall } from "../interfaces";

function aCall(id: string): TurnCall {
  return {
    id,
    source: "command",
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
      called: null,
      memories: [],
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

  it("treats a maximum of nought as no ceiling — never spent, and never overspent", () => {
    const ledger = new TurnLedger();

    for (let spent = 0; spent < 50; spent += 1) {
      ledger.spend();
    }

    assert.equal(ledger.isSpent(0), false);
    assert.equal(ledger.wouldOverspend(1000, 0), false);
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

  it("keeps the compressions the agents it called made, in the order they were made, whatever else the turn did", () => {
    const ledger = new TurnLedger();
    const one = {
      cost: {
        inputTokens: 1,
        outputTokens: 1,
        money: null,
      },
      facts: null,
    };
    const other = {
      cost: null,
      facts: null,
    };

    ledger.composed([one]);
    ledger.composed([other]);

    assert.deepEqual(ledger.answer().memories, [one, other]);
  });

  it("adds up what the agents it called cost, and names nothing while none has cost anything", () => {
    const ledger = new TurnLedger();

    ledger.billedFor(null);

    assert.equal(ledger.answer().called, null);

    ledger.billedFor({
      inputTokens: 10,
      outputTokens: 1,
      money: 0.001,
    });
    ledger.billedFor({
      inputTokens: 5,
      outputTokens: 2,
      money: null,
    });

    assert.deepEqual(ledger.answer().called, {
      inputTokens: 15,
      outputTokens: 3,
      money: 0.001,
    });
  });
});
