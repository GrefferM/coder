import { describe, expect, it } from "vitest";
import { stepBegan } from "./step-began";
import {
  RUN_STEP_CALLS,
  RUN_STEP_CEILING,
  RUN_STEP_DONE,
  RUN_STEP_FAILED,
  RUN_STEP_SILENT,
  RUN_STEP_STOPPED,
  RUN_STEP_TOO_LONG,
} from "../constants";

describe("stepBegan", () => {
  it("counts every end of a turn that went out", () => {
    for (const end of [
      RUN_STEP_DONE,
      RUN_STEP_FAILED,
      RUN_STEP_STOPPED,
      RUN_STEP_SILENT,
      RUN_STEP_CEILING,
      RUN_STEP_CALLS,
    ]) {
      expect(stepBegan(end)).toBe(true);
    }
  });

  it("counts words over the model's ceiling as a turn that never went", () => {
    // The words did not fit, so nothing left the app — the step is a record of a refusal.
    expect(stepBegan(RUN_STEP_TOO_LONG)).toBe(false);
  });

  it("counts every reason the turn was refused for as a turn that never went", () => {
    for (const reason of ["noKey", "noModel", "noProvider", "noAddress", "notFilled", "unreachable", "lostPrompt"]) {
      expect(stepBegan(reason)).toBe(false);
    }
  });
});
