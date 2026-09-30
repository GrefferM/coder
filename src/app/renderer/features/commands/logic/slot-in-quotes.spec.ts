import { describe, expect, it } from "vitest";
import { slotInQuotes } from "./slot-in-quotes";

describe("slotInQuotes", () => {
  it("finds a slot wrapped in quotes of its own", () => {
    expect(slotInQuotes("npm test -- '{mask}'", "mask")).toBe(true);
  });

  it("reads double quotes the same way, since the app puts neither and reads both", () => {
    expect(slotInQuotes('npm test -- "{mask}"', "mask")).toBe(true);
  });

  it("says nothing of a slot standing bare", () => {
    // The slot goes and leaves nothing behind.
    expect(slotInQuotes("npm test -- {mask}", "mask")).toBe(false);
  });

  it("says nothing of a slot inside a longer quoted string", () => {
    // Dropping it leaves the rest of the string, not an empty pair.
    expect(slotInQuotes("grep '{mask} out'", "mask")).toBe(false);
  });

  it("says nothing where the quotes do not match each other", () => {
    expect(slotInQuotes("npm test -- '{mask}\"", "mask")).toBe(false);
  });

  it("looks at every place the slot is written, not only the first", () => {
    expect(slotInQuotes("cp {mask} '{mask}'", "mask")).toBe(true);
  });

  it("says nothing about another slot's quotes", () => {
    expect(slotInQuotes("npm test -- '{mask}' {bail}", "bail")).toBe(false);
  });

  it("says nothing of a name nobody typed yet", () => {
    expect(slotInQuotes("npm test -- '{mask}'", "  ")).toBe(false);
  });
});
