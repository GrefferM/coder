import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StandingPill } from "./standing-pill";
import {
  STANDING_GONE_LABEL,
  STANDING_PILL_SEPARATOR,
  STANDING_RENAMED_LABEL,
  STANDING_WAS_PREFIX,
} from "../../../../../../constants";
import type { AgentStanding } from "../../../../../../../record";

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

describe("StandingPill", () => {
  it("says nothing where the record and the project call the agent the same", () => {
    // Renders nothing when the record and the project agree.
    const { container } = render(<StandingPill standing={standing()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("names the record's own name where the agent is called something else now", () => {
    render(
      <StandingPill
        standing={standing({
          wasName: "EDITOR",
        })}
      />,
    );

    expect(
      screen.getByText(`${STANDING_RENAMED_LABEL}${STANDING_PILL_SEPARATOR}${STANDING_WAS_PREFIX}EDITOR`),
    ).toBeInTheDocument();
  });

  it("wears a solid border for a renamed agent: it stands in the project, only under another name", () => {
    // Solid is a state that exists, dashed is something the project does not have.
    const { container } = render(
      <StandingPill
        standing={standing({
          wasName: "EDITOR",
        })}
      />,
    );

    expect(container.querySelector("span > span")).toHaveStyle({
      border: "1px solid #262b3a",
    });
  });

  it("says only that an agent is gone, and wears the dashed border for it", () => {
    const { container } = render(
      <StandingPill
        standing={standing({
          name: "REVIEWER",
          isGone: true,
        })}
      />,
    );

    expect(screen.getByText(STANDING_GONE_LABEL)).toBeInTheDocument();
    expect(container.querySelector("span > span")).toHaveStyle({
      border: "1px dashed #3a2a30",
    });
  });

  it("says the agent is gone rather than what it was called, since the record's name is the only one there is", () => {
    render(
      <StandingPill
        standing={standing({
          name: "REVIEWER",
          isGone: true,
        })}
      />,
    );

    expect(screen.queryByText(new RegExp(STANDING_RENAMED_LABEL))).not.toBeInTheDocument();
  });

  it("writes the recorded name in the capitals every name on a canvas is drawn in", () => {
    // The name is upper-cased like the sphere's label.
    const { container } = render(
      <StandingPill
        standing={standing({
          wasName: "Тезар",
        })}
      />,
    );

    expect(container.querySelector("span > span")).toHaveClass("text-uppercase");
  });
});
