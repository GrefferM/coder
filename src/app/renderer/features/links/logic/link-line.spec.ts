import { describe, expect, it } from "vitest";
import { linkLine } from "./link-line";
import { LINK_ARROW_LENGTH_PX, LINK_HEAD_GAP_PX, LINK_TAIL_GAP_PX } from "../constants";

const RADIUS = 80;

const FROM = {
  x: 0,
  y: 0,
};

const TO = {
  x: 500,
  y: 0,
};

describe("linkLine", () => {
  it("leaves both spheres by their own gap rather than touching them", () => {
    const line = linkLine(FROM, TO, RADIUS);

    expect(line.x1).toBe(RADIUS + LINK_TAIL_GAP_PX);
    expect(line.x2).toBe(TO.x - RADIUS - LINK_HEAD_GAP_PX);
    expect(line.y1).toBe(0);
    expect(line.y2).toBe(0);
  });

  it("puts the middle halfway along the run it actually draws, not between the two spheres", () => {
    const line = linkLine(FROM, TO, RADIUS);

    expect(line.middle.x).toBe((line.x1 + line.x2) / 2);
    expect(line.middle.y).toBe(0);
    // The two gaps differ, so the drawn run's middle is not the midpoint between the spheres.
    expect(line.middle.x).not.toBe(TO.x);
  });

  it("points the arrow at the end of the line, wide enough to read", () => {
    const [tip, left, right] = linkLine(FROM, TO, RADIUS).arrow.split(" ");

    expect(tip).toBe(`${TO.x - RADIUS - LINK_HEAD_GAP_PX},0`);
    expect(left).not.toBe(right);
  });

  it("stops the drawn line at the arrow's base, so a round cap cannot poke past the point", () => {
    const line = linkLine(FROM, TO, RADIUS);

    expect(line.stem.x).toBe(line.x2 - LINK_ARROW_LENGTH_PX);
    expect(line.stem.y).toBe(0);
  });

  it("keeps the stem behind the tip at any angle, not only along an axis", () => {
    const line = linkLine(
      FROM,
      {
        x: 300,
        y: 400,
      },
      RADIUS,
    );

    expect(Math.hypot(line.x2 - line.stem.x, line.y2 - line.stem.y)).toBeCloseTo(LINK_ARROW_LENGTH_PX);
  });

  it("arrives at whatever angle it arrives at, since there are no ports", () => {
    const line = linkLine(
      FROM,
      {
        x: 300,
        y: 400,
      },
      RADIUS,
    );

    // The line runs along the 3-4-5 diagonal: 102 from one end, 110 short of the other.
    expect(Math.hypot(line.x1, line.y1)).toBeCloseTo(RADIUS + LINK_TAIL_GAP_PX);
    expect(Math.hypot(line.x2 - 300, line.y2 - 400)).toBeCloseTo(RADIUS + LINK_HEAD_GAP_PX);
  });

  it("survives two agents standing on the same point", () => {
    expect(() => linkLine(FROM, FROM, RADIUS)).not.toThrow();
  });
});
