import { describe, expect, it } from "vitest";
import { emptyWalk } from "./empty-walk";

describe("emptyWalk", () => {
  it("is empty in every part the backend tells of", () => {
    const state = emptyWalk();

    expect(state.out).toEqual({});
    expect(state.walks).toEqual({});
    expect(state.saidAgain).toEqual([]);
    expect(state.flowRunId).toBeNull();
  });

  it("gives a fresh state each time and never the same one twice", () => {
    const first = emptyWalk();
    const second = emptyWalk();

    first.saidAgain.push("turn-1");

    expect(second.saidAgain).toEqual([]);
  });
});
