import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UnsavedMark } from "./unsaved-mark";
import { UNSAVED_MARK_COLOR, UNSAVED_MARK_LABEL } from "./constants";

describe("UnsavedMark", () => {
  it("says there is unsaved work, in the colour a draft is marked with", () => {
    // «● НЕ ЗБЕРЕЖЕНО» beside the name of a thing whose draft is not written yet.
    render(<UnsavedMark />);

    expect(screen.getByText(UNSAVED_MARK_LABEL)).toHaveStyle({
      color: UNSAVED_MARK_COLOR,
    });
  });
});
