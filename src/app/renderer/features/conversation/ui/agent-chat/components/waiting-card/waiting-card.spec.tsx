import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WaitingCard } from "./waiting-card";
import type { Agent, WaitingSupplier } from "../../../../../../interfaces";
import { anAgent } from "../../../../../../testing";

function agent(id: string, name: string): Agent {
  return anAgent({
    id,
    name,
    x: 0,
    y: 0,
    maxCalls: 5,
    temperature: 0.3,
  });
}

const AGENTS = [agent("agent-1", "TESTER"), agent("agent-2", "LINTER")];

function card(suppliers: WaitingSupplier[]) {
  return render(
    <WaitingCard
      waiting={{
        agentId: "agent-3",
        isAwaitingRepeat: false,
        suppliers,
      }}
      color="#6fd3d8"
      agents={AGENTS}
    />,
  );
}

describe("WaitingCard", () => {
  it("counts the answers against every live supplier, and says what ends the wait", () => {
    card([
      {
        agentId: "agent-1",
        state: "answered",
        seconds: 48,
      },
      {
        agentId: "agent-2",
        state: "working",
        seconds: null,
      },
    ]);

    expect(screen.getByText("Відповіли 1 / 2")).toBeInTheDocument();
    expect(screen.getByText("48 c")).toBeInTheDocument();
    expect(screen.getByText("ще працює")).toBeInTheDocument();
    // The wait ends when the supplier speaks or stops being able to.
    expect(
      screen.getByText("Візьметься до роботи, щойно LINTER або відповість, або перестане відповідати зовсім."),
    ).toBeInTheDocument();
  });

  it("does not call a supplier that has had its turn and said nothing one that is still working", () => {
    card([
      {
        agentId: "agent-1",
        state: "silent",
        seconds: null,
      },
      {
        agentId: "agent-2",
        state: "working",
        seconds: null,
      },
    ]);

    expect(screen.getByText("не відповів")).toBeInTheDocument();
    // It is not counted as an answer either: nothing arrived from it.
    expect(screen.getByText("Відповіли 0 / 2")).toBeInTheDocument();
  });
});
