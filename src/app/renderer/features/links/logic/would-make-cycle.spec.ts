import { describe, expect, it } from "vitest";
import { wouldMakeCycle } from "./would-make-cycle";
import type { Link } from "../../../interfaces";
import { aLink } from "../../../testing";

function link(from: string, to: string): Link {
  return aLink({
    id: `${from}-${to}`,
    from,
    to,
  });
}

describe("wouldMakeCycle", () => {
  it("lets a line go on down the graph", () => {
    expect(wouldMakeCycle([link("a", "b")], "b", "c")).toBe(false);
  });

  it("lets two lines converge, which is what a diamond is made of", () => {
    const links = [link("a", "b"), link("a", "c"), link("b", "d")];

    expect(wouldMakeCycle(links, "c", "d")).toBe(false);
  });

  it("refuses the line back, since two agents pointing at each other would never stop", () => {
    expect(wouldMakeCycle([link("a", "b")], "b", "a")).toBe(true);
  });

  it("refuses a ring closed through anybody in between", () => {
    expect(wouldMakeCycle([link("a", "b"), link("b", "c")], "c", "a")).toBe(true);
  });

  it("refuses a line onto the agent itself", () => {
    expect(wouldMakeCycle([], "a", "a")).toBe(true);
  });
});
