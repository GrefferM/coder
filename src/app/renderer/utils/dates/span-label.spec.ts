import { describe, expect, it } from "vitest";
import { spanLabel } from "./span-label";
import { SPAN_UNDER_SECOND_LABEL } from "./constants";

describe("spanLabel", () => {
  it("says seconds while it is under a minute", () => {
    expect(spanLabel(44_000)).toBe("44 c");
    expect(spanLabel(1_900)).toBe("1 c");
  });

  it("says what a run shorter than a second is, rather than saying it took nothing", () => {
    expect(spanLabel(900)).toBe(SPAN_UNDER_SECOND_LABEL);
    expect(spanLabel(0)).toBe(SPAN_UNDER_SECOND_LABEL);
  });

  it("says minutes and the seconds left over", () => {
    expect(spanLabel(138_000)).toBe("2 хв 18");
  });

  it("says the minutes alone when nothing is left over", () => {
    expect(spanLabel(720_000)).toBe("12 хв");
  });

  it("rounds down, since a run is as long as it has been", () => {
    expect(spanLabel(59_999)).toBe("59 c");
  });
});
