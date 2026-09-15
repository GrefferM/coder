import { describe, expect, it } from "vitest";
import { forgotten } from "./forgotten";

describe("forgotten", () => {
  it("leaves the record without that key", () => {
    expect(
      forgotten(
        {
          one: 1,
          two: 2,
        },
        "one",
      ),
    ).toEqual({
      two: 2,
    });
  });

  it("leaves a key it never held alone", () => {
    expect(
      forgotten(
        {
          one: 1,
        },
        "two",
      ),
    ).toEqual({
      one: 1,
    });
  });

  it("does not touch the record it was given", () => {
    const standing = {
      one: 1,
    };

    forgotten(standing, "one");

    expect(standing).toEqual({
      one: 1,
    });
  });
});
