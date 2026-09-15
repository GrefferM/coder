import { describe, expect, it } from "vitest";
import { walkHead, walkLine } from "./walk-line";

/** The gutters are counted off these: 10 + 2 × 5 out, and 20 + 8 + 2 × 5 in. */
const SIZES = {
  radius: 30,
  tailAir: 10,
  headAir: 20,
  corner: 5,
  arrow: 8,
  wing: 4,
};

const TOP = {
  x: 100,
  y: 100,
};

describe("walkLine", () => {
  it("runs straight along the row where both turns stand in it", () => {
    const line = walkLine(
      TOP,
      {
        x: 300,
        y: 100,
      },
      SIZES,
      false,
    );

    // It starts a breath off the sender's rim and stops at the head's base, not at the rim.
    expect(line.path).toBe("M 140 100 L 242 100");
  });

  it("leaves by the sender's own gutter where the receiver hangs a lane below", () => {
    const line = walkLine(
      TOP,
      {
        x: 300,
        y: 200,
      },
      SIZES,
      false,
    );

    // Out of the rim, down the gutter beside the sender, along the lane, and on to the head.
    expect(line.path).toBe("M 140 100 L 145 100 Q 150 100 150 105 L 150 195 Q 150 200 155 200 L 242 200");
  });

  it("rises in the receiver's gutter where it comes back up, and turns into the row with a corner", () => {
    const line = walkLine(
      {
        x: 100,
        y: 200,
      },
      {
        x: 500,
        y: 100,
      },
      SIZES,
      false,
    );

    // Both turns are rounded: the one out of the lane, and the one out of the gutter into the row.
    expect(line.path).toBe("M 140 200 L 427 200 Q 432 200 432 195 L 432 105 Q 432 100 437 100 L 442 100");
  });

  it("keeps the corner whole at the receiver, since the gutter is counted to hold it", () => {
    // Gutter = air + head + two corners, so the bend never has to be cut back to fit.
    const line = walkLine(
      {
        x: 100,
        y: 200,
      },
      {
        x: 500,
        y: 100,
      },
      SIZES,
      false,
    );

    // The bend turns a full corner's width before the head's base, and no less.
    expect(line.path).toContain("Q 432 100 437 100");
  });

  it("draws no diagonal anywhere: every run is along one axis or the other", () => {
    const path = walkLine(
      TOP,
      {
        x: 400,
        y: 300,
      },
      SIZES,
      false,
    ).path;

    expect(path).not.toContain("C");
    expect(path.split("Q")).toHaveLength(3);
  });

  it("stands the head off the rim rather than against it, wide enough to read", () => {
    const [tip, left, right] = walkLine(
      TOP,
      {
        x: 300,
        y: 100,
      },
      SIZES,
      false,
    ).arrow.split(" ");

    expect(tip).toBe("250,100");
    expect(left).toBe("242,96");
    expect(right).toBe("242,104");
  });

  it("carries no head of its own where the receiver draws one for them all, but is drawn whole", () => {
    const shared = walkLine(
      {
        x: 100,
        y: 200,
      },
      {
        x: 500,
        y: 100,
      },
      SIZES,
      true,
    );
    const own = walkLine(
      {
        x: 100,
        y: 200,
      },
      {
        x: 500,
        y: 100,
      },
      SIZES,
      false,
    );

    // Two identical points in one spot read as a single blot, so only the head is dropped;
    // the line still turns its own corner into the row rather than stopping square on the gutter.
    expect(shared.arrow).toBe("");
    expect(shared.path).toBe(own.path);
  });
});

describe("walkHead", () => {
  it("gives the receiver the one head every line into it arrives at", () => {
    expect(
      walkHead(
        {
          x: 500,
          y: 100,
        },
        SIZES,
      ),
    ).toBe("450,100 442,96 442,104");
  });
});
