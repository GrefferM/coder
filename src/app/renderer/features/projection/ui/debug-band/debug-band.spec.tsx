import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DebugBand } from "./debug-band";
import { DEBUG_BAND_LABEL } from "./constants";

describe("DebugBand", () => {
  it("opens the projection of the run the conversation is writing into", () => {
    const onOpen = vi.fn();

    render(<DebugBand onOpen={onOpen} />);
    screen.getByText(DEBUG_BAND_LABEL).click();

    expect(onOpen).toHaveBeenCalled();
  });
});
