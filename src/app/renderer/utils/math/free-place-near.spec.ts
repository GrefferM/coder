import { describe, expect, it } from "vitest";
import { freePlaceNear } from "./free-place-near";
import { FREE_PLACE_STEP_PX } from "./constants";

const WANTED = {
  x: 500,
  y: 400,
};

describe("freePlaceNear", () => {
  it("gives the wanted point back when nothing stands near it", () => {
    expect(
      freePlaceNear(WANTED, [
        {
          x: 900,
          y: 400,
        },
      ]),
    ).toEqual(WANTED);
  });

  it("steps aside once from a point another agent already holds", () => {
    expect(freePlaceNear(WANTED, [WANTED])).toEqual({
      x: WANTED.x + FREE_PLACE_STEP_PX,
      y: WANTED.y + FREE_PLACE_STEP_PX,
    });
  });

  it("keeps stepping until the place is clear, so agents never stack", () => {
    const taken = [
      WANTED,
      {
        x: WANTED.x + FREE_PLACE_STEP_PX,
        y: WANTED.y + FREE_PLACE_STEP_PX,
      },
    ];

    expect(freePlaceNear(WANTED, taken)).toEqual({
      x: WANTED.x + FREE_PLACE_STEP_PX * 2,
      y: WANTED.y + FREE_PLACE_STEP_PX * 2,
    });
  });

  it("counts a place as taken by a sphere standing close rather than exactly on it", () => {
    expect(
      freePlaceNear(WANTED, [
        {
          x: WANTED.x + 40,
          y: WANTED.y,
        },
      ]),
    ).not.toEqual(WANTED);
  });
});
