import { describe, expect, it } from "vitest";
import { begunWalk } from "./begun-walk";

describe("begunWalk", () => {
  it("begins with nothing said, nothing waiting, nothing stopped and nothing put away", () => {
    // A fresh walk carries none of the marks it can earn.
    const walk = begunWalk("question-1", 1_000);

    expect(walk.said).toEqual([]);
    expect(walk.waiting).toEqual({});
    expect(walk.isStopped).toBe(false);
    expect(walk.isPutAway).toBe(false);
  });

  it("keeps the question and the hour it was asked", () => {
    const walk = begunWalk("question-1", 1_000);

    expect(walk.questionId).toBe("question-1");
    expect(walk.askedAt).toBe(1_000);
  });

  it("stands on no row until it is given one", () => {
    // A stream with no row learns it when the question opens one.
    expect(begunWalk("question-1", 1_000).runId).toBeNull();
    expect(begunWalk("question-1", 1_000, "run-1").runId).toBe("run-1");
  });

  it("gives every walk its own said and its own waiting, never one shared between them", () => {
    // Walks in two conversations share no list.
    const first = begunWalk("question-1", 1_000);
    const second = begunWalk("question-2", 2_000);

    expect(first.said).not.toBe(second.said);
    expect(first.waiting).not.toBe(second.waiting);
  });
});
