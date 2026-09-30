import type { OpenCalls } from "../../../../hooks";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WorkingTurn } from "./working-turn";
import { WORK_CARD_LABEL } from "../work-card/constants";
import type { Agent, WorkingAgent } from "../../../../../../interfaces";
import { anAgent } from "../../../../../../testing";

function agent(id: string, name: string, color: string): Agent {
  return anAgent({
    id,
    name,
    color,
    x: 0,
    y: 0,
  });
}

const turn: WorkingAgent = {
  turnId: "turn-1",
  agentId: "agent-2",
  startedAt: Date.now(),
  askedAt: Date.now(),
  questionId: "question-1",
};

/** Stand-in for the chat's open-calls memory: nothing is open. */
function standInOpenCalls(): OpenCalls {
  return {
    isOpen: () => false,
    toggle: () => {},
    open: () => {},
  };
}

describe("WorkingTurn", () => {
  it("counts the seconds of a turn still out", () => {
    render(
      <WorkingTurn
        openCalls={standInOpenCalls()}
        turn={turn}
        agents={[agent("agent-1", "Шукач", "#6fd3d8"), agent("agent-2", "Перелікар", "#e8c46a")]}
        agentName="Шукач"
        agentColor="#6fd3d8"
      />,
    );

    expect(
      screen.getByText(WORK_CARD_LABEL, {
        exact: false,
      }),
    ).toBeInTheDocument();
  });

  it("takes the turn's own agent, not the stream's, one stream holding the turns of all of them", () => {
    // A walk runs through several agents though the chat is aimed at one.
    const { container } = render(
      <WorkingTurn
        openCalls={standInOpenCalls()}
        turn={turn}
        agents={[agent("agent-1", "Шукач", "#6fd3d8"), agent("agent-2", "Перелікар", "#e8c46a")]}
        agentName="Шукач"
        agentColor="#6fd3d8"
      />,
    );

    expect(container.querySelector(".work-bar")).toHaveStyle({
      background: "#e8c46a",
    });
  });

  it("falls back to the stream's own agent where the turn's is not among them", () => {
    const { container } = render(
      <WorkingTurn openCalls={standInOpenCalls()} turn={turn} agents={[]} agentName="Шукач" agentColor="#6fd3d8" />,
    );

    expect(container.querySelector(".work-bar")).toHaveStyle({
      background: "#6fd3d8",
    });
  });

  it("shows no answer card while nothing has been said yet", () => {
    // Nothing to draw until the first token arrives.
    render(
      <WorkingTurn openCalls={standInOpenCalls()} turn={turn} agents={[]} agentName="Шукач" agentColor="#6fd3d8" />,
    );

    expect(screen.queryByText("Шукач")).not.toBeInTheDocument();
  });
});
