import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { isStepStanding, useStandingStep } from "./use-standing-step";

describe("useStandingStep", () => {
  it("says a step stands while one does, and stops saying it once the step is left", () => {
    expect(isStepStanding()).toBe(false);

    const { unmount } = renderHook(() => useStandingStep(true));

    expect(isStepStanding()).toBe(true);

    unmount();

    expect(isStepStanding()).toBe(false);
  });

  it("counts nothing while the step is not standing", () => {
    renderHook(() => useStandingStep(false));

    expect(isStepStanding()).toBe(false);
  });
});
