import { describe, expect, it } from "vitest";
import { fitView } from "./fit-view";

const STOPS = {
  min: 0.25,
  max: 2,
  step: 0.1,
};
const BOX = {
  width: 800,
  height: 600,
};

describe("fitView", () => {
  it("takes the largest stop the whole graph fits at, and puts its middle in the middle of the box", () => {
    expect(
      fitView(
        [
          {
            x: 300,
            y: 200,
          },
          {
            x: 640,
            y: 420,
          },
        ],
        BOX,
        STOPS,
        120,
      ),
    ).toEqual({
      scale: expect.closeTo(1.3),
      pan: {
        x: expect.closeTo(400 - 470 * 1.3),
        y: expect.closeTo(300 - 310 * 1.3),
      },
    });
  });

  it("leaves the padding around the outermost spheres, so a lone agent is not blown up to the ceiling by mistake", () => {
    const fitted = fitView(
      [
        {
          x: 1000,
          y: 1000,
        },
      ],
      {
        width: 480,
        height: 480,
      },
      STOPS,
      120,
    );

    // 240 across with the padding, in a box of 480: twice over, which is the ceiling anyway.
    expect(fitted?.scale).toBeCloseTo(2);
    expect(fitted?.pan).toEqual({
      x: expect.closeTo(240 - 2000),
      y: expect.closeTo(240 - 2000),
    });
  });

  it("goes no smaller than the bound, however far apart the spheres stand", () => {
    expect(
      fitView(
        [
          {
            x: 0,
            y: 0,
          },
          {
            x: 40_000,
            y: 0,
          },
        ],
        BOX,
        STOPS,
        120,
      )?.scale,
    ).toBeCloseTo(0.25);
  });

  it("has nothing to fit in an empty project, and nowhere to fit it in a box with no size", () => {
    expect(fitView([], BOX, STOPS, 120)).toBeNull();
    expect(
      fitView(
        [
          {
            x: 0,
            y: 0,
          },
        ],
        {
          width: 0,
          height: 0,
        },
        STOPS,
        120,
      ),
    ).toBeNull();
  });
});
