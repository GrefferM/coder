import { describe, expect, it } from "vitest";
import { begunWalk } from "./begun-walk";

describe("begunWalk", () => {
  it("begins with nothing said, nothing waiting, nothing stopped and nothing put away", () => {
    // The walk is only just out — every mark it can carry is a mark it has not earned yet.
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
    // A stream that has no row learns it when the question opens one, and not before.
    expect(begunWalk("question-1", 1_000).runId).toBeNull();
    expect(begunWalk("question-1", 1_000, "run-1").runId).toBe("run-1");
  });

  it("gives every walk its own said and its own waiting, never one shared between them", () => {
    // Two walks go on at once in two conversations; one list held in common would put a word into both.
    const first = begunWalk("question-1", 1_000);
    const second = begunWalk("question-2", 2_000);

    expect(first.said).not.toBe(second.said);
    expect(first.waiting).not.toBe(second.waiting);
  });
});
