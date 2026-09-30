import { describe, expect, it } from "vitest";
import { standingIn } from "./standing-in";

const FOUND = ["three", "two", "one"];

describe("standingIn", () => {
  it("stands on the first of them until a hand moves it, and the first is the freshest", () => {
    // A just-typed word lands on its last occurrence: «1 З 3», not «3 З 3».
    expect(standingIn(FOUND, null, null)).toBe(0);
  });

  it("stands where the hand moved it", () => {
    expect(standingIn(FOUND, 2, null)).toBe(2);
  });

  it("keeps the promise a pressed row made, which outranks the freshest", () => {
    expect(standingIn(FOUND, null, "one")).toBe(2);
  });

  it("lets a hand overrule that promise, the walk being the hand's own", () => {
    expect(standingIn(FOUND, 0, "one")).toBe(0);
  });

  it("stands on the first where the promise is one this stream does not hold", () => {
    expect(standingIn(FOUND, null, "elsewhere")).toBe(0);
  });

  it("stands on nought where nothing was found at all", () => {
    expect(standingIn([], null, null)).toBe(0);
  });
});
