import { describe, expect, it } from "vitest";
import { playedClock, soundClock } from "./sound-clock";

describe("soundClock", () => {
  it("says a recording's length in minutes and seconds", () => {
    expect(soundClock(7_000)).toBe("0:07");
    expect(soundClock(83_400)).toBe("1:23");
  });
});

describe("playedClock", () => {
  it("says how far a recording is played against its length", () => {
    expect(playedClock(3_000, 7_000)).toBe("0:03 / 0:07");
  });

  it("says the length alone while it stands", () => {
    expect(playedClock(null, 7_000)).toBe("0:07");
  });

  it("never says more played than there is", () => {
    expect(playedClock(7_400, 7_000)).toBe("0:07 / 0:07");
  });
});
