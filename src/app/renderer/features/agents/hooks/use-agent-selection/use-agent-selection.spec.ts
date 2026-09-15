import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAgentSelection } from "./use-agent-selection";
import { aConfig, anAgent } from "../../../../testing";
import type { AgentWrites } from "../use-agent-writes";
import type { CanvasHandle } from "../../../../interfaces";
import type { OpenProject } from "../../../../interfaces";

const PROJECT: OpenProject = {
  directory: "/tmp/coder",
  config: aConfig({
    agents: [
      anAgent({
        id: "agent-1",
      }),
      anAgent({
        id: "agent-2",
      }),
    ],
  }),
  view: null,
};

/** The writes, standing in for the project file: they answer, and the spec asks what they were told. */
function writes(): AgentWrites {
  return <AgentWrites>(<unknown>{
    createAgent: vi.fn(async () => "agent-new"),
    deleteAgent: vi.fn(async () => undefined),
  });
}

function canvas(
  at = {
    x: 400,
    y: 300,
  },
) {
  return {
    current: <CanvasHandle>{
      centre: () => at,
    },
  };
}

function selection(
  hands: { writes?: AgentWrites; onLetGoOfCopy?: () => void; canvasAt?: { x: number; y: number } } = {},
) {
  const held = hands.writes ?? writes();
  const letGo = hands.onLetGoOfCopy ?? vi.fn();
  const view = renderHook(() => useAgentSelection(PROJECT, held, canvas(hands.canvasAt), letGo));

  return {
    ...view,
    held,
    letGo,
  };
}

describe("useAgentSelection · the hand on the canvas", () => {
  it("selects a sphere, and drops the copy's mark with the same press", () => {
    // A sphere's click does not reach the window, so the mark on a copied agent is let go here or nowhere.
    const { result, letGo } = selection();

    act(() => result.current.select("agent-1"));

    expect(result.current.selectedAgentId).toBe("agent-1");
    expect(letGo).toHaveBeenCalled();
  });

  it("lets the selection go on empty space", () => {
    const { result } = selection();

    act(() => result.current.select("agent-1"));
    act(() => result.current.select(null));

    expect(result.current.selectedAgentId).toBeNull();
  });

  it("keeps the claimed point until the agent is written, and puts the new sphere there", async () => {
    // The right-click claims a place; the sphere appears only after the write, and stands where claimed.
    const { result, held } = selection();

    act(() =>
      result.current.claimPoint({
        x: 120,
        y: 90,
      }),
    );

    expect(result.current.pending).toEqual({
      kind: "point",
      at: {
        x: 120,
        y: 90,
      },
    });
    // The claim is a place for something that is not there yet, so nothing stands selected under it.
    expect(result.current.selectedAgentId).toBeNull();

    await act(() => result.current.createAgent("ТЕЗАР", "model-1"));

    expect(held.createAgent).toHaveBeenCalledWith("ТЕЗАР", "model-1", {
      x: 120,
      y: 90,
    });
    expect(result.current.pending).toBeNull();
    expect(result.current.selectedAgentId).toBe("agent-new");
  });

  it("asks the canvas where its middle is at the moment of writing, not when the claim was made", async () => {
    // The panel opening changes the width; the middle read at save time is the middle the person sees.
    const { result, held } = selection({
      canvasAt: {
        x: 640,
        y: 360,
      },
    });

    act(() => result.current.claimCentre());
    await act(() => result.current.createAgent("ТЕЗАР", "model-1"));

    expect(held.createAgent).toHaveBeenCalledWith("ТЕЗАР", "model-1", {
      x: 640,
      y: 360,
    });
  });

  it("takes a put-down copy as the selected agent and drops any claim", () => {
    const { result } = selection();

    act(() =>
      result.current.claimPoint({
        x: 10,
        y: 10,
      }),
    );
    act(() => result.current.takePut("agent-2"));

    expect(result.current.selectedAgentId).toBe("agent-2");
    expect(result.current.pending).toBeNull();
  });
});

describe("useAgentSelection · the question before deleting", () => {
  it("asks first, and the agent asked about stands selected while the question is up", () => {
    // Deletion always asks, and the person sees which sphere the question is about.
    const { result, held } = selection();

    act(() => result.current.requestDelete("agent-1"));

    expect(result.current.doomedAgentId).toBe("agent-1");
    expect(result.current.selectedAgentId).toBe("agent-1");
    expect(held.deleteAgent).not.toHaveBeenCalled();
  });

  it("takes the question back when anything else is selected", () => {
    const { result } = selection();

    act(() => result.current.requestDelete("agent-1"));
    act(() => result.current.select("agent-2"));

    expect(result.current.doomedAgentId).toBeNull();
  });

  it("deletes on the yes, and lets go of the selection that pointed at it", async () => {
    const { result, held } = selection();

    act(() => result.current.requestDelete("agent-1"));
    await act(() => {
      result.current.confirmDelete();
    });

    expect(held.deleteAgent).toHaveBeenCalledWith("agent-1");
    expect(result.current.doomedAgentId).toBeNull();
    expect(result.current.selectedAgentId).toBeNull();
  });

  it("deletes nothing on the no", () => {
    const { result, held } = selection();

    act(() => result.current.requestDelete("agent-1"));
    act(() => result.current.dismissDelete());

    expect(result.current.doomedAgentId).toBeNull();
    expect(held.deleteAgent).not.toHaveBeenCalled();
  });

  it("asks about nobody once the project no longer holds the agent the question named", () => {
    // The agent went another way — a second window, an undo — while the question stood open here.
    const { result } = selection();

    act(() => result.current.requestDelete("agent-gone"));

    expect(result.current.doomedAgentId).toBeNull();
  });

  it("clears the selection, the claim and the question when the panel closes", () => {
    const { result } = selection();

    act(() => result.current.requestDelete("agent-1"));
    act(() =>
      result.current.claimPoint({
        x: 10,
        y: 10,
      }),
    );
    act(() => result.current.reset());

    expect(result.current.selectedAgentId).toBeNull();
    expect(result.current.pending).toBeNull();
    expect(result.current.doomedAgentId).toBeNull();
  });
});
