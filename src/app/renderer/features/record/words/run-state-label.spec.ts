import { describe, expect, it } from "vitest";
import { runStateLabel } from "./run-state-label";
import { RUN_DONE, RUN_FAILED, RUN_NOT_SENT, RUN_RUNNING, RUN_STOPPED } from "../constants";

describe("runStateLabel · how a run stands, in one word", () => {
  it("says the same word for every state, wherever it is asked", () => {
    expect(runStateLabel(RUN_RUNNING)).toBe("ІДЕ");
    expect(runStateLabel(RUN_DONE)).toBe("ГОТОВО");
    expect(runStateLabel(RUN_FAILED)).toBe("УПАВ");
    expect(runStateLabel(RUN_STOPPED)).toBe("ЗУПИНЕНО");
    expect(runStateLabel(RUN_NOT_SENT)).toBe("НЕ ПІШОВ");
  });

  it("names the step a run fell on where the screen knows it", () => {
    expect(runStateLabel(RUN_FAILED, 3)).toBe("УПАВ НА КРОЦІ 3");
  });

  it("names no step for a run that did not fall, whatever step it is told", () => {
    expect(runStateLabel(RUN_STOPPED, 3)).toBe("ЗУПИНЕНО");
  });

  it("says nothing about a state nobody wrote, rather than a word of its own", () => {
    expect(runStateLabel("посеред нічого")).toBe("");
  });
});
