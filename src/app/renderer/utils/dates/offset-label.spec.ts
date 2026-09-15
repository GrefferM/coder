import { describe, expect, it } from "vitest";
import { offsetLabel } from "./offset-label";

describe("offsetLabel", () => {
  it("reads the start of a run as zero", () => {
    expect(offsetLabel(0)).toBe("0:00");
  });

  it("keeps two digits of seconds, so the marks of the ruler stand in one column", () => {
    expect(offsetLabel(12_000)).toBe("0:12");
    expect(offsetLabel(76_000)).toBe("1:16");
  });

  it("counts minutes past the hour on, since a run is measured from its own start", () => {
    expect(offsetLabel(3_726_000)).toBe("62:06");
  });

  it("rounds down, so a mark never stands ahead of the step it names", () => {
    expect(offsetLabel(11_999)).toBe("0:11");
  });

  it("reads a moment before the start as zero", () => {
    expect(offsetLabel(-5_000)).toBe("0:00");
  });
});
