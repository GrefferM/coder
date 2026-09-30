import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HandoffRow } from "./handoff-row";
import {
  HANDOFF_ROW_LABEL,
  HANDOFF_ROW_NOT_SENT_LABEL,
  HANDOFF_ROW_STOPPED_COLOR,
  HANDOFF_ROW_STOPPED_LABEL,
} from "./constants";

describe("HandoffRow", () => {
  it("names both agents, each in its own colour", () => {
    render(
      <HandoffRow
        word={HANDOFF_ROW_LABEL}
        fromName="EDITOR"
        fromColor="#b18aff"
        name="REVIEWER"
        color="#6fd3d8"
        reason={null}
      />,
    );

    // The row names whose work is moving.
    expect(screen.getByText(HANDOFF_ROW_LABEL)).toBeInTheDocument();
    expect(screen.getByText("EDITOR")).toHaveStyle({
      color: "#b18aff",
    });
    expect(screen.getByText("REVIEWER")).toHaveStyle({
      color: "#6fd3d8",
    });
  });

  it("says the work did not go, and why, when the line ends at the agent it points to", () => {
    render(
      <HandoffRow
        word={HANDOFF_ROW_STOPPED_LABEL}
        fromName="EDITOR"
        fromColor="#b18aff"
        name="REVIEWER"
        color="#6fd3d8"
        reason="вимкнений"
      />,
    );

    expect(screen.getByText(HANDOFF_ROW_STOPPED_LABEL)).toBeInTheDocument();
    expect(screen.getByText(/вимкнений/)).toBeInTheDocument();

    // A line nothing went down has no colour at either end.
    expect(screen.getByText("REVIEWER")).toHaveStyle({
      color: HANDOFF_ROW_STOPPED_COLOR,
    });
    expect(screen.getByText("EDITOR")).toHaveStyle({
      color: HANDOFF_ROW_STOPPED_COLOR,
    });
  });
  it("says the question itself did not go where there was nobody to hand it", () => {
    render(
      <HandoffRow
        word={HANDOFF_ROW_NOT_SENT_LABEL}
        fromName={null}
        fromColor={null}
        name="EDITOR"
        color="#38a3ff"
        reason="зайнятий"
      />,
    );

    // The person's own question has no sender, so no «НЕ ПЕРЕДАЄ».
    expect(screen.getByText(HANDOFF_ROW_NOT_SENT_LABEL)).toBeInTheDocument();
    expect(screen.queryByText(HANDOFF_ROW_STOPPED_LABEL)).not.toBeInTheDocument();
    // The agent it was for keeps its own colour.
    expect(screen.getByText("EDITOR")).toHaveStyle({
      color: "#38a3ff",
    });
  });
});
