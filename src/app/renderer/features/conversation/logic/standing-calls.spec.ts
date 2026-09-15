import { describe, expect, it } from "vitest";
import { standingCalls } from "./standing-calls";
import type { LiveCall } from "../../../interfaces";

function call(id: string, state: string): LiveCall {
  return {
    id,
    name: "find_deep",
    arguments: {
      depth: "2",
    },
    pinned: [],
    line: "",
    output: "",
    refusal: "",
    exitCode: null,
    serverId: null,
    serverName: "",
    isFailed: false,
    startedAt: 1,
    endedAt: 0,
    state,
  };
}

describe("standingCalls", () => {
  it("keeps calls in the order they went out", () => {
    const one = standingCalls([], call("a", "running"));
    const both = standingCalls(one, call("b", "running"));

    expect(both.map((made) => made.id)).toEqual(["a", "b"]);
  });

  it("says the same call over rather than a second time", () => {
    const out = standingCalls([call("a", "running"), call("b", "running")], call("a", "ran"));

    expect(out.map((made) => [made.id, made.state])).toEqual([
      ["a", "ran"],
      ["b", "running"],
    ]);
  });
});
