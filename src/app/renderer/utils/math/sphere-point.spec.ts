import { describe, expect, it } from "vitest";
import { meridianPoint, parallelPoint } from "./sphere-point";

describe("meridianPoint", () => {
  it("lies exactly in the view plane when the sphere isn't tilted", () => {
    const point = meridianPoint(0, 10, 0, Math.PI / 4);

    expect(point.z).toBeCloseTo(0);
  });

  it("places the pole on the tilt axis, independent of longitude", () => {
    const north = meridianPoint(0, 10, 0.3, Math.PI / 2);
    const northFromAnotherMeridian = meridianPoint(1.2, 10, 0.3, Math.PI / 2);

    expect(north.x).toBeCloseTo(0);
    expect(north.y).toBeCloseTo(northFromAnotherMeridian.y);
    expect(north.z).toBeCloseTo(northFromAnotherMeridian.z);
  });
});

describe("parallelPoint", () => {
  it("lies exactly in the view plane at its own equator crossing when the sphere isn't tilted", () => {
    const point = parallelPoint(0.4, 10, 0, 0);

    expect(point.z).toBeCloseTo(0);
  });

  it("collapses to the tilt axis at the poles", () => {
    const point = parallelPoint(Math.PI / 2, 10, 0.5, 2);

    expect(point.x).toBeCloseTo(0);
    expect(point.y).toBeCloseTo(10 * Math.cos(0.5));
  });
});
