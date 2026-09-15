import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAgentDraft } from "./use-agent-draft";
import { NAME_TAKEN_AGENT_NOTE } from "../../../../constants";
import type { AgentWrites } from "../use-agent-writes";
import type { OpenProject } from "../../../../interfaces";
import { aConfig, anAgent } from "../../../../testing";

const EDITOR = anAgent({
  id: "agent-1",
  name: "EDITOR",
});
const REVIEWER = anAgent({
  id: "agent-2",
  name: "REVIEWER",
});

function project(): OpenProject {
  return {
    directory: "/code/coder",
    config: aConfig({
      agents: [EDITOR, REVIEWER],
    }),
    view: null,
  };
}

function writes(): AgentWrites {
  return {
    createAgent: vi.fn(),
    saveAgent: vi.fn(),
    deleteAgent: vi.fn(),
    pasteAgent: vi.fn(),
    moveAgent: vi.fn(),
  };
}

describe("useAgentDraft", () => {
  it("says nothing about a name nobody else has", () => {
    const { result } = renderHook(() => useAgentDraft(project(), writes(), "agent-1"));

    act(() =>
      result.current.edit({
        name: "WRITER",
      }),
    );

    expect(result.current.isNameTaken).toBe(false);
    expect(result.current.unsaved?.blockedNote).toBeNull();
  });

  it("says whose the name is when another sphere already has it", () => {
    const { result } = renderHook(() => useAgentDraft(project(), writes(), "agent-1"));

    act(() =>
      result.current.edit({
        name: "REVIEWER",
      }),
    );

    expect(result.current.isNameTaken).toBe(true);
    expect(result.current.unsaved?.blockedNote).toBe(NAME_TAKEN_AGENT_NOTE);
  });

  it("does not count the agent's own name against it", () => {
    // Opening the tab and typing the name back is not a collision with itself.
    const { result } = renderHook(() => useAgentDraft(project(), writes(), "agent-1"));

    act(() =>
      result.current.edit({
        name: "EDITOR ",
      }),
    );

    expect(result.current.isNameTaken).toBe(false);
  });

  it("refuses the write while the name is taken", async () => {
    const hands = writes();
    const { result } = renderHook(() => useAgentDraft(project(), hands, "agent-1"));

    act(() =>
      result.current.edit({
        name: "REVIEWER",
      }),
    );
    await act(() => result.current.save());

    expect(hands.saveAgent).not.toHaveBeenCalled();
  });

  it("writes once the name is the agent's own again", async () => {
    const hands = writes();
    const { result } = renderHook(() => useAgentDraft(project(), hands, "agent-1"));

    act(() =>
      result.current.edit({
        name: "REVIEWER",
      }),
    );
    act(() =>
      result.current.edit({
        name: "WRITER",
      }),
    );
    await act(() => result.current.save());

    expect(hands.saveAgent).toHaveBeenCalled();
  });

  it("counts a name written in another case as the same name", () => {
    // The sphere's label is drawn in capitals, so two agents like this would be one picture on the canvas.
    const { result } = renderHook(() => useAgentDraft(project(), writes(), "agent-1"));

    act(() =>
      result.current.edit({
        name: "Reviewer",
      }),
    );

    expect(result.current.isNameTaken).toBe(true);
  });
});
