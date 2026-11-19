import { describe, expect, it } from "vitest";
import { isPauseAfterSpeech } from "./is-pause-after-speech";

const QUIET = Array.from(
  {
    length: 15,
  },
  () => 0.02,
);

describe("isPauseAfterSpeech", () => {
  it("ends a take once a second and a half has gone quiet after speech", () => {
    expect(isPauseAfterSpeech([0.4, 0.5, ...QUIET], 100)).toBe(true);
  });

  it("ends nothing before anything was said, however long the silence", () => {
    expect(isPauseAfterSpeech([...QUIET, ...QUIET], 100)).toBe(false);
  });

  it("ends nothing while the pause is still short", () => {
    expect(isPauseAfterSpeech([0.4, ...QUIET.slice(5)], 100)).toBe(false);
  });
});
