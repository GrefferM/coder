import type { OpenCalls } from "../../../../hooks";
import { RUN_CALL_RUNNING } from "../../../../../record";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WorkCard } from "./work-card";
import { WORK_CARD_LABEL } from "./constants";
import type { LiveCall } from "../../../../../../interfaces";

function call(id: string): LiveCall {
  return {
    id,
    name: "find_deep",
    arguments: {},
    pinned: [],
    line: "",
    output: "",
    refusal: "",
    exitCode: null,
    serverId: null,
    serverName: "",
    isFailed: false,
    state: RUN_CALL_RUNNING,
    startedAt: Date.now(),
    endedAt: 0,
  };
}

/** The chat's own memory of open calls, standing in — here nothing is open, since nobody pressed. */
function standInOpenCalls(): OpenCalls {
  return {
    isOpen: () => false,
    toggle: () => {},
    open: () => {},
  };
}

describe("WorkCard", () => {
  it("says the turn is working and counts what it has taken so far", () => {
    render(<WorkCard openCalls={standInOpenCalls()} agentColor="#6fd3d8" startedAt={Date.now()} calls={[]} />);

    expect(
      screen.getByText(WORK_CARD_LABEL, {
        exact: false,
      }),
    ).toBeInTheDocument();
  });

  it("stands every call the turn has made under it", () => {
    // The calls are what the waiting is made of, so they are shown while it lasts.
    render(
      <WorkCard
        openCalls={standInOpenCalls()}
        agentColor="#6fd3d8"
        startedAt={Date.now()}
        calls={[call("call-1"), call("call-2")]}
      />,
    );

    expect(screen.getAllByText("find_deep")).toHaveLength(2);
  });

  it("paints the moving bar in the agent's own colour", () => {
    const { container } = render(
      <WorkCard openCalls={standInOpenCalls()} agentColor="#6fd3d8" startedAt={Date.now()} calls={[]} />,
    );

    expect(container.querySelector(".work-bar")).toHaveStyle({
      background: "#6fd3d8",
    });
  });
});
