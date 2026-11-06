import { describe, expect, it } from "vitest";
import { playedBars, soundLevel, wavePeaks } from "./sound-wave";

describe("soundLevel", () => {
  it("hears silence as nought", () => {
    expect(soundLevel(new Uint8Array([128, 128, 128, 128]))).toBe(0);
  });

  it("hears a voice at the top of its swing as full, never more", () => {
    expect(soundLevel(new Uint8Array([255, 0, 255, 0]))).toBe(1);
  });

  it("hears a quiet voice as a share of a loud one", () => {
    const level = soundLevel(new Uint8Array([144, 112, 144, 112]));

    expect(level).toBeGreaterThan(0);
    expect(level).toBeLessThan(1);
  });

  it("hears nothing in no samples", () => {
    expect(soundLevel(new Uint8Array([]))).toBe(0);
  });
});

describe("wavePeaks", () => {
  it("draws each bar as the loudest moment of its share", () => {
    expect(wavePeaks([0.1, 0.9, 0.2, 0.3, 0.8, 0.4], 3)).toEqual([0.9, 0.3, 0.8]);
  });

  it("keeps a recording shorter than the bars as it was", () => {
    expect(wavePeaks([0.1, 0.5], 46)).toEqual([0.1, 0.5]);
  });
});

describe("playedBars", () => {
  it("counts the bars behind the share played", () => {
    expect(playedBars(46, 3 / 7)).toBe(20);
  });

  it("holds the count within the wave", () => {
    expect(playedBars(46, 1.4)).toBe(46);
    expect(playedBars(46, -0.2)).toBe(0);
  });
});
