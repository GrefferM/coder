import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AimPicker } from "./aim-picker";
import {
  AIM_PICKER_ARIA_LABEL,
  AIM_PICKER_NOBODY_LABEL,
  AIM_PICKER_OFF_LABEL,
  AIM_PICKER_SEARCH_FROM,
  AIM_PICKER_SEARCH_PLACEHOLDER,
} from "./constants";
import type { Agent } from "../../../../interfaces";
import { anAgent } from "../../../../testing";

function agent(patch: Partial<Agent> = {}): Agent {
  return anAgent({
    name: "Тезар",
    color: "#b18aff",
    x: 0,
    y: 0,
    maxCalls: 3,
    ...patch,
  });
}

/** Enough agents for the search, each named apart. */
function crowd(): Agent[] {
  return Array.from(
    {
      length: AIM_PICKER_SEARCH_FROM,
    },
    (_, index) =>
      agent({
        id: `agent-${index}`,
        name: `Агент ${index}`,
      }),
  );
}

function aim() {
  return screen.getByRole("button", {
    name: AIM_PICKER_ARIA_LABEL,
  });
}

describe("AimPicker", () => {
  it("says whom the chat is aimed at", () => {
    render(<AimPicker agents={[agent()]} aimedAgentId="agent-1" onAim={() => {}} />);

    expect(aim()).toHaveTextContent("Тезар");
  });

  it("says nobody is aimed at while nobody is", () => {
    render(<AimPicker agents={[agent()]} aimedAgentId={null} onAim={() => {}} />);

    expect(aim()).toHaveTextContent(AIM_PICKER_NOBODY_LABEL);
  });

  it("keeps the name ordinary and gives the colour to the dot", () => {
    render(<AimPicker agents={[agent()]} aimedAgentId="agent-1" onAim={() => {}} />);

    fireEvent.click(aim());

    // The name appears on the button and in the list; this targets the list's.
    const row = within(screen.getByRole("listbox")).getByText("Тезар");

    // Coloured names in a row make a list nobody can read.
    expect(row).not.toHaveStyle({
      color: "#b18aff",
    });
  });

  it("stands the ones switched off together at the end, under a word said once", () => {
    render(
      <AimPicker
        aimedAgentId="agent-1"
        onAim={() => {}}
        agents={[
          agent({
            id: "agent-2",
            name: "Столяр",
            isActive: false,
          }),
          agent(),
        ]}
      />,
    );

    fireEvent.click(aim());

    const rows = within(screen.getByRole("listbox")).getAllByRole("button");

    expect(rows[0]).toHaveTextContent("Тезар");
    expect(rows[1]).toHaveTextContent("Столяр");
    expect(screen.getByText(AIM_PICKER_OFF_LABEL)).toBeInTheDocument();
  });

  it("says nothing about switching off while nobody is switched off", () => {
    render(<AimPicker agents={[agent()]} aimedAgentId="agent-1" onAim={() => {}} />);

    fireEvent.click(aim());

    expect(screen.queryByText(AIM_PICKER_OFF_LABEL)).not.toBeInTheDocument();
  });

  it("hands the chosen agent out and shuts the list", () => {
    const onAim = vi.fn();

    render(
      <AimPicker
        aimedAgentId={null}
        onAim={onAim}
        agents={[
          agent(),
          agent({
            id: "agent-2",
            name: "Столяр",
          }),
        ]}
      />,
    );

    fireEvent.click(aim());
    fireEvent.click(screen.getByText("Столяр"));

    expect(onAim).toHaveBeenCalledWith("agent-2");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("leaves a short list without a search, since eight names are read at a glance", () => {
    render(<AimPicker agents={[agent()]} aimedAgentId={null} onAim={() => {}} />);

    fireEvent.click(aim());

    expect(screen.queryByPlaceholderText(AIM_PICKER_SEARCH_PLACEHOLDER)).not.toBeInTheDocument();
  });

  it("brings the search with the thirteenth agent, and keeps only what was asked for", () => {
    render(<AimPicker agents={crowd()} aimedAgentId={null} onAim={() => {}} />);

    fireEvent.click(aim());

    const search = screen.getByPlaceholderText(AIM_PICKER_SEARCH_PLACEHOLDER);

    expect(search).toBeInTheDocument();

    fireEvent.change(search, {
      target: {
        value: "Агент 7",
      },
    });

    expect(within(screen.getByRole("listbox")).getAllByRole("button")).toHaveLength(1);
  });

  it("walks the rows with the arrows and takes the one walked to on Enter", () => {
    const onAim = vi.fn();

    render(
      <AimPicker
        aimedAgentId={null}
        onAim={onAim}
        agents={[
          agent(),
          agent({
            id: "agent-2",
            name: "Столяр",
          }),
        ]}
      />,
    );

    fireEvent.click(aim());

    const list = screen.getByRole("listbox");

    fireEvent.keyDown(list, {
      key: "ArrowDown",
    });
    fireEvent.keyDown(list, {
      key: "Enter",
    });

    expect(onAim).toHaveBeenCalledWith("agent-2");
  });
});
