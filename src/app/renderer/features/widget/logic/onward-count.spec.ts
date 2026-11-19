import { describe, expect, it } from "vitest";
import { onwardCount } from "./onward-count";
import { aLink } from "../../../testing";

describe("onwardCount", () => {
  it("counts every agent after this one once, through a branch and a join", () => {
    const links = [
      aLink({
        id: "l1",
        from: "editor",
        to: "tester",
      }),
      aLink({
        id: "l2",
        from: "editor",
        to: "linter",
      }),
      aLink({
        id: "l3",
        from: "tester",
        to: "reviewer",
      }),
      aLink({
        id: "l4",
        from: "linter",
        to: "reviewer",
      }),
    ];

    expect(onwardCount("editor", links)).toBe(3);
    expect(onwardCount("reviewer", links)).toBe(0);
  });
});
