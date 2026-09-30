import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StandingChanges } from "./standing-changes";
import { STANDING_CHANGES_GONE_LABEL, STANDING_CHANGES_LABEL } from "../../../../constants";
import type { AgentChange } from "../../../../interfaces";

function change(patch: Partial<AgentChange> = {}): AgentChange {
  return {
    id: "agent-1",
    name: "WRITER",
    isGone: false,
    wasModel: "claude-sonnet-4.5",
    wasTemperature: 0.2,
    nowModel: "claude-opus-4.1",
    nowTemperature: 0.7,
    ...patch,
  };
}

describe("StandingChanges", () => {
  it("holds the record's circumstances against the project's", () => {
    render(<StandingChanges changes={[change()]} />);

    expect(screen.getByText(STANDING_CHANGES_LABEL)).toBeInTheDocument();
    expect(screen.getByText("WRITER")).toBeInTheDocument();
    expect(screen.getByText(/claude-sonnet-4\.5 · темп\. 0\.2/)).toBeInTheDocument();
    expect(screen.getByText(/claude-opus-4\.1 · темп\. 0\.7/)).toBeInTheDocument();
  });

  it("says the agent is gone in place of what it would run on now", () => {
    render(
      <StandingChanges
        changes={[
          change({
            isGone: true,
            nowModel: null,
            nowTemperature: null,
          }),
        ]}
      />,
    );

    expect(screen.getByText(STANDING_CHANGES_GONE_LABEL)).toBeInTheDocument();
    // The model it ran on then is still shown; the record keeps it.
    expect(screen.getByText(/claude-sonnet-4\.5/)).toBeInTheDocument();
  });

  it("stands nothing at all over a run where nothing has moved", () => {
    const { container } = render(<StandingChanges changes={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("gives every agent its own card", () => {
    render(
      <StandingChanges
        changes={[
          change(),
          change({
            id: "agent-2",
            name: "REVIEWER",
          }),
        ]}
      />,
    );

    expect(screen.getByText("WRITER")).toBeInTheDocument();
    expect(screen.getByText("REVIEWER")).toBeInTheDocument();
  });

  it("leaves out a temperature nobody wrote rather than standing a nought for it", () => {
    render(
      <StandingChanges
        changes={[
          change({
            wasTemperature: null,
          }),
        ]}
      />,
    );

    expect(screen.getByText("claude-sonnet-4.5")).toBeInTheDocument();
  });
});
