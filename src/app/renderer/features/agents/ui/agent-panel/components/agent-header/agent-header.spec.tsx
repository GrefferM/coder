import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AgentHeader } from "./agent-header";
import { AGENT_HEADER_AVATAR_OFF_BACKGROUND_COLOR } from "./constants";
import {
  STATE_LIVE_COLOR,
  STATE_OFF_COLOR,
  STATE_OFF_LABEL,
  STATE_PROVIDER_SILENT_LABEL,
  STATE_READY_LABEL,
  STATE_STOP_COLOR,
  STATE_WONT_START_LABEL,
  STATE_WORKING_LABEL,
} from "../../../../constants";
import type { AgentState } from "../../../../interfaces";

const READY: AgentState = {
  label: STATE_READY_LABEL,
  color: STATE_LIVE_COLOR,
  mark: "dot",
  at: null,
};

function renderHeader(state: AgentState, isActive = true, startedAt: number | null = null) {
  return render(<AgentHeader name="EDITOR" color="#38a3ff" isActive={isActive} state={state} startedAt={startedAt} />);
}

describe("AgentHeader", () => {
  it("stands the agent's name over both its faces, and says it is ready", () => {
    renderHeader(READY);

    expect(screen.getByText("EDITOR")).toBeInTheDocument();
    expect(screen.getByText(STATE_READY_LABEL)).toBeInTheDocument();
  });

  it("says a switched-off agent is off rather than ready", () => {
    renderHeader(
      {
        label: STATE_OFF_LABEL,
        color: STATE_OFF_COLOR,
        mark: "dot",
        at: null,
      },
      false,
    );

    expect(screen.getByText(STATE_OFF_LABEL)).toBeInTheDocument();
  });

  it("takes the colour off a switched-off agent rather than dimming it", () => {
    const { container } = renderHeader(READY, false);

    expect(container.querySelector("span")).toHaveStyle({
      background: AGENT_HEADER_AVATAR_OFF_BACKGROUND_COLOR,
    });
  });

  it("counts a turn that is out from its start, with the dots running instead of the dot", () => {
    const { container } = renderHeader(
      {
        label: STATE_WORKING_LABEL,
        color: STATE_LIVE_COLOR,
        mark: "clock",
        at: null,
      },
      true,
      Date.now(),
    );

    expect(screen.getByText(`${STATE_WORKING_LABEL} · 00:00`)).toBeInTheDocument();
    expect(container.querySelectorAll(".work-dot")).toHaveLength(3);
  });

  it("wears the sign instead of the dot where the agent cannot start at all", () => {
    const { container } = renderHeader({
      label: STATE_WONT_START_LABEL,
      color: STATE_STOP_COLOR,
      mark: "sign",
      at: null,
    });

    expect(screen.getByText(STATE_WONT_START_LABEL)).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("says the moment the machine was asked at, after the separator", () => {
    renderHeader({
      label: STATE_PROVIDER_SILENT_LABEL,
      color: STATE_STOP_COLOR,
      mark: "dot",
      at: new Date(2026, 7, 19, 14, 26),
    });

    expect(screen.getByText(`${STATE_PROVIDER_SILENT_LABEL} · 14:26`)).toBeInTheDocument();
  });
});
