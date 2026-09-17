import { describe, expect, it } from "vitest";
import { deadEnd } from "./dead-end";
import { QUIET_MARK_COLOR } from "../../../constants";

describe("deadEnd", () => {
  it("names the end by the head of the id, since there is no name to give", () => {
    expect(
      deadEnd("a3f9c1e7-1234-4444-8888-abcdefabcdef", {
        x: 10,
        y: 20,
      }),
    ).toEqual({
      name: "A3F9C1E7",
      color: QUIET_MARK_COLOR,
      x: 10,
      y: 20,
    });
  });

  it("takes the quiet tone, because a colour is an agent's own and there is no agent", () => {
    expect(
      deadEnd("agent-gone", {
        x: 0,
        y: 0,
      }).color,
    ).toBe(QUIET_MARK_COLOR);
  });
});
