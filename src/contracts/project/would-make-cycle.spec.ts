import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { wouldMakeCycle } from "./would-make-cycle";
import type { Link } from "./link.interface";

function link(from: string, to: string): Link {
  return {
    id: `${from}-${to}`,
    from,
    to,
  };
}

describe("wouldMakeCycle", () => {
  it("lets a line go on down the graph", () => {
    assert.equal(wouldMakeCycle([link("a", "b")], "b", "c"), false);
  });

  it("lets two lines converge, which is what a diamond is made of", () => {
    const links = [link("a", "b"), link("a", "c"), link("b", "d")];

    assert.equal(wouldMakeCycle(links, "c", "d"), false);
  });

  it("refuses the line back, since two agents pointing at each other would never stop", () => {
    assert.equal(wouldMakeCycle([link("a", "b")], "b", "a"), true);
  });

  it("refuses a ring closed through anybody in between", () => {
    assert.equal(wouldMakeCycle([link("a", "b"), link("b", "c")], "c", "a"), true);
  });

  it("refuses a line onto the agent itself", () => {
    assert.equal(wouldMakeCycle([], "a", "a"), true);
  });
});
