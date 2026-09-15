import { describe, expect, it } from "vitest";
import { sharedLabels } from "./shared-labels";

describe("sharedLabels", () => {
  it("leaves both whole when the line holds them", () => {
    expect(sharedLabels("ТЕЗАР", "ЗБИРАЧ", 20)).toEqual(["ТЕЗАР", "ЗБИРАЧ"]);
  });

  it("gives the room the short one leaves to the long one", () => {
    expect(sharedLabels("ТЕЗАР", "Е".repeat(40), 20)).toEqual(["ТЕЗАР", `${"Е".repeat(14)}…`]);
  });

  it("does the same when it is the first one that is long", () => {
    expect(sharedLabels("Е".repeat(40), "ТЕЗАР", 20)).toEqual([`${"Е".repeat(14)}…`, "ТЕЗАР"]);
  });

  it("halves the room where both are long", () => {
    expect(sharedLabels("А".repeat(30), "Б".repeat(30), 21)).toEqual([`${"А".repeat(9)}…`, `${"Б".repeat(10)}…`]);
  });
});
