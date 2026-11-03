import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StandingBand } from "./standing-band";
import { STANDING_BAND_LABEL } from "../../../../constants";
import type { AgentStanding } from "../../../../../record";

function standing(patch: Partial<AgentStanding> = {}): AgentStanding {
  return {
    id: "agent-1",
    name: "WRITER",
    color: "#6fd3d8",
    wasName: null,
    isGone: false,
    ...patch,
  };
}

describe("StandingBand", () => {
  it("stands over a run whose agent is called something else now", () => {
    render(
      <StandingBand
        standings={[
          standing({
            wasName: "EDITOR",
          }),
        ]}
      />,
    );

    expect(screen.getByText(STANDING_BAND_LABEL)).toBeInTheDocument();
  });

  it("stands over a run whose agent the project no longer has", () => {
    render(
      <StandingBand
        standings={[
          standing({
            isGone: true,
          }),
        ]}
      />,
    );

    expect(screen.getByText(STANDING_BAND_LABEL)).toBeInTheDocument();
  });

  it("says nothing over a run where the record and the project agree", () => {
    const { container } = render(<StandingBand standings={[standing(), standing()]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("says nothing where no run is open", () => {
    const { container } = render(<StandingBand standings={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
