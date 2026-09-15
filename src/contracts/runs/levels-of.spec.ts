import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { levelsOf } from "./levels-of";

/** One turn, named by its own id unless the test says otherwise. */
function turn(id: string, fedBy: string[] = [], at: string | null = id) {
  return {
    id,
    at,
    fedBy,
  };
}

describe("levelsOf", () => {
  it("stands a turn nobody fed on the first step", () => {
    assert.deepEqual(levelsOf([turn("one")]), {
      one: 1,
    });
  });

  it("stands a turn one below whoever fed it", () => {
    assert.deepEqual(levelsOf([turn("one"), turn("two", ["one"])]), {
      one: 1,
      two: 2,
    });
  });

  it("stands two turns that ran at once on the same step", () => {
    const levels = levelsOf([turn("one"), turn("left", ["one"]), turn("right", ["one"])]);

    assert.equal(levels.left, levels.right);
  });

  it("stands a converging point below the deepest supplier, where it waited", () => {
    const levels = levelsOf([
      turn("one"),
      turn("quick", ["one"]),
      turn("slow", ["one"]),
      turn("deeper", ["slow"]),
      turn("point", ["quick", "deeper"]),
    ]);

    assert.equal(levels.point, 4);
  });

  it("walks a ring once and no further, breaking it where the walk went in", () => {
    // A ring has no first turn, so there is no right answer to pick — only a terminating one. The walk enters
    // at the first turn it is given, and whoever fed that turn is left standing first.
    assert.deepEqual(levelsOf([turn("one", ["two"]), turn("two", ["one"])]), {
      one: 2,
      two: 1,
    });
  });

  it("leaves out a feeder that is not among the turns", () => {
    assert.deepEqual(levelsOf([turn("one", ["gone"])]), {
      one: 1,
    });
  });

  it("answers under a turn's own key while a feeder names it by the step it was written as", () => {
    const levels = levelsOf([turn("card-one", [], "step-one"), turn("card-two", ["step-one"], "step-two")]);

    assert.deepEqual(levels, {
      "card-one": 1,
      "card-two": 2,
    });
  });

  it("stands a turn with no step of its own on the first, since nobody can name it", () => {
    assert.deepEqual(levelsOf([turn("live", [], null)]), {
      live: 1,
    });
  });
});
