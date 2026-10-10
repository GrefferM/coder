import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { begunWalk } from "./begun-walk";

describe("begunWalk", () => {
  it("begins with nothing said, nothing waiting, nothing stopped and nothing put away", () => {
    // A fresh walk carries none of the marks it can earn.
    const walk = begunWalk("question-1", 1_000);

    assert.deepEqual(walk.said, []);
    assert.deepEqual(walk.waiting, {});
    assert.equal(walk.isStopped, false);
    assert.equal(walk.isPutAway, false);
  });

  it("keeps the question and the hour it was asked", () => {
    const walk = begunWalk("question-1", 1_000);

    assert.equal(walk.questionId, "question-1");
    assert.equal(walk.askedAt, 1_000);
  });

  it("stands on no row until it is given one", () => {
    // A stream with no row learns it when the question opens one.
    assert.equal(begunWalk("question-1", 1_000).runId, null);
    assert.equal(begunWalk("question-1", 1_000, "run-1").runId, "run-1");
  });

  it("gives every walk its own said and its own waiting, never one shared between them", () => {
    // Walks in two conversations share no list.
    const first = begunWalk("question-1", 1_000);
    const second = begunWalk("question-2", 2_000);

    assert.notEqual(first.said, second.said);
    assert.notEqual(first.waiting, second.waiting);
  });
});
