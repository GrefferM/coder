import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AgentSphere } from "./agent-sphere";
import { WORK_PILL_LABEL } from "../work-pill/constants";
import { WAIT_PILL_LABEL } from "../wait-pill/constants";
import type { Agent, WaitingAgent, WorkingAgent } from "../../../../../interfaces";
import type { AgentSphereProps, SphereActs, SphereDoing, SpherePlace, SphereWearing } from "./interfaces";
import { anAgent } from "../../../../../testing";

const seeker: Agent = anAgent({
  y: 80,
});

const teller: Agent = {
  ...seeker,
  id: "agent-2",
  name: "Перелікар",
};

/** What one case changes, part by part; everything it leaves out stands as this fixture sets it. */
interface SphereOverrides {
  agent?: Agent;
  place?: Partial<SpherePlace>;
  wearing?: Partial<SphereWearing>;
  doing?: Partial<SphereDoing>;
  acts?: Partial<SphereActs>;
}

function props(patch: SphereOverrides = {}): AgentSphereProps {
  return {
    agent: patch.agent ?? seeker,
    place: {
      at: {
        x: 100,
        y: 80,
      },
      scale: 1,
      markScale: 1,
      isDrawnSmall: false,
      isDragged: false,
      ...patch.place,
    },
    wearing: {
      standing: {
        isSelected: false,
        isAimed: false,
        isDimmed: false,
      },
      isActive: true,
      stateColor: "#4ade80",
      modelTitle: "deepseek-v4-flash",
      trouble: null,
      trail: {
        hasPrompt: false,
        tools: 0,
      },
      // What the sources say of themselves; the arc is built from the grants, and this only names them.
      sources: {
        commands: [],
        servers: [],
        looks: {},
      },
      ...patch.wearing,
    },
    doing: {
      working: null,
      waiting: null,
      calling: null,
      agents: [seeker, teller],
      ...patch.doing,
    },
    acts: {
      onSelect: vi.fn(),
      onGrab: vi.fn(),
      onMenu: vi.fn(),
      onPressOrb: () => {},
      onPointToOrb: () => {},
      onPointAwayFromOrb: () => {},
      ...patch.acts,
    },
  };
}

const working: WorkingAgent = {
  turnId: "turn-1",
  agentId: "agent-1",
  startedAt: Date.now(),
  askedAt: Date.now(),
  questionId: "question-1",
};

const waiting: WaitingAgent = {
  agentId: "agent-1",
  suppliers: [
    {
      agentId: "agent-2",
      state: "working",
      seconds: 3,
    },
  ],
  isAwaitingRepeat: false,
};

describe("AgentSphere", () => {
  it("stands at its own place, named", () => {
    const { container } = render(<AgentSphere {...props()} />);

    expect(screen.getByText("Шукач")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveStyle({
      left: "100px",
      top: "80px",
    });
  });

  it("follows the pointer while it is dragged, and does not catch it", () => {
    // A dragged sphere must not take the pointer it is following, or the drag would end on itself.
    const { container } = render(
      <AgentSphere
        {...props({
          place: {
            at: {
              x: 220,
              y: 140,
            },
            isDragged: true,
          },
        })}
      />,
    );

    expect(container.firstElementChild).toHaveStyle({
      left: "220px",
      top: "140px",
      pointerEvents: "none",
    });
  });

  it("wears what it is doing: the working pill, or the waiting one, or neither", () => {
    // One sphere, one thing under its name — it is either out or holding.
    const { rerender } = render(<AgentSphere {...props()} />);

    expect(
      screen.queryByText(WORK_PILL_LABEL, {
        exact: false,
      }),
    ).not.toBeInTheDocument();

    rerender(
      <AgentSphere
        {...props({
          doing: {
            working,
          },
        })}
      />,
    );

    expect(
      screen.getByText(WORK_PILL_LABEL, {
        exact: false,
      }),
    ).toBeInTheDocument();

    rerender(
      <AgentSphere
        {...props({
          doing: {
            waiting,
          },
        })}
      />,
    );

    expect(
      screen.getByText(WAIT_PILL_LABEL, {
        exact: false,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(WORK_PILL_LABEL, {
        exact: false,
      }),
    ).not.toBeInTheDocument();
  });

  it("says what it is calling beside itself, and only while the call is out", () => {
    // The arc does not move for a call — this pill is the whole of what the canvas says.
    const { rerender } = render(
      <AgentSphere
        {...props({
          doing: {
            calling: {
              name: "run_test",
              isCommand: true,
            },
          },
        })}
      />,
    );

    expect(screen.getByText("run_test")).toBeInTheDocument();

    rerender(<AgentSphere {...props()} />);

    expect(screen.queryByText("run_test")).not.toBeInTheDocument();
  });

  it("names whom it waits for, looking that name up among the agents", () => {
    // The wait carries ids, and a person reads names.
    render(
      <AgentSphere
        {...props({
          doing: {
            waiting,
          },
        })}
      />,
    );

    expect(
      screen.getByText("Перелікар", {
        exact: false,
      }),
    ).toBeInTheDocument();
  });

  it("opens its own menu on a right click, and keeps that click from the canvas behind it", async () => {
    const said = props();

    render(<AgentSphere {...said} />);
    await userEvent.pointer({
      keys: "[MouseRight]",
      target: screen.getByText("Шукач"),
    });

    expect(said.acts.onMenu).toHaveBeenCalled();
  });
});
