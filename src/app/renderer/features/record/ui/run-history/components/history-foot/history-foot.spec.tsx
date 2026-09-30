import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HistoryFoot } from "./history-foot";
import { RUN_HISTORY_SWEEP_NOTE } from "../../constants";

describe("HistoryFoot", () => {
  it("says under the last row how long the record lives", () => {
    // The thirty days are said once, at the end of the list.
    render(<HistoryFoot />);

    expect(screen.getByText(RUN_HISTORY_SWEEP_NOTE)).toBeInTheDocument();
  });
});
