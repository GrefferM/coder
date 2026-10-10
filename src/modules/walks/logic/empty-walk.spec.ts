import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { emptyWalk } from "./empty-walk";

describe("emptyWalk", () => {
  it("is empty in every part a stream can hold", () => {
    // What «+ НОВИЙ ЧАТ» returns to: nothing out, walked or aimed at.
    const state = emptyWalk();

    assert.deepEqual(state.out, {});
    assert.deepEqual(state.walks, {});
    assert.deepEqual(state.ledgers, {});
    assert.deepEqual(state.saidAgain, []);
    assert.deepEqual(state.drafts, {});
    assert.deepEqual(state.attachments, {});
    assert.equal(state.aimedAgentId, null);
    assert.equal(state.flowRunId, null);
  });

  it("gives a fresh state each time and never the same one twice", () => {
    // Emptying twice shares nothing between the two results.
    const first = emptyWalk();
    const second = emptyWalk();

    first.saidAgain.push("turn-1");
    first.drafts["agent-1"] = "недописане";
    first.attachments["agent-1"] = [];
    first.aimedAgentId = "agent-1";

    assert.deepEqual(second.saidAgain, []);
    assert.deepEqual(second.drafts, {});
    assert.deepEqual(second.attachments, {});
    assert.equal(second.aimedAgentId, null);
  });
});
