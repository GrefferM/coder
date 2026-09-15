import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WasLine } from "./was-line";
import { FIELD_SLOT_WAS_PREFIX } from "../../constants";

describe("WasLine", () => {
  it("says what a save would replace", () => {
    // The third of the draft's marks — the dot, the stepped edge, and this line.
    render(<WasLine value="0.3" />);

    expect(screen.getByText(`${FIELD_SLOT_WAS_PREFIX}0.3`)).toBeInTheDocument();
  });
});
