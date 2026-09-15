import { useState } from "react";
import type { RefObject } from "react";
import type { OpenProject } from "../../../../interfaces";
import type { CanvasHandle, PendingPlacement } from "../../../../interfaces";
import type { AgentWrites } from "../use-agent-writes";
import type { AgentSelection } from "./interfaces";
import type { Point } from "../../../../utils/math";

/** The agent under the hand; writes go through the agents' own `AgentWrites`. */
export function useAgentSelection(
  project: OpenProject,
  writes: AgentWrites,
  canvasRef: RefObject<CanvasHandle | null>,
  onLetGoOfCopy: () => void,
): AgentSelection {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingPlacement | null>(null);
  // The agent whose deletion is being asked about.
  const [armedAgentId, setArmedAgentId] = useState<string | null>(null);
  const doomedAgentId = project.config.agents.some((agent) => agent.id === armedAgentId) ? armedAgentId : null;
  /** Deletes the agent and clears the selection that pointed at it; its unsaved edits go with the selection. */
  async function removeAgent(agentId: string) {
    setSelectedAgentId(null);
    await writes.deleteAgent(agentId);
  }

  /** Canvas click: a sphere selects, empty space deselects. */
  function select(agentId: string | null) {
    setSelectedAgentId(agentId);
    // Selecting anything else withdraws the deletion question.
    setArmedAgentId(null);
    // A sphere's click does not reach the window, so the copy's mark is dropped here too.
    onLetGoOfCopy();
    // Any selection change abandons the creation claim.
    setPending(null);
  }

  /** Claims the clicked point for the agent being created; a second right-click moves the claim. */
  function claimPoint(at: Point) {
    setPending({
      kind: "point",
      at,
    });
    setSelectedAgentId(null);
  }

  /** Claims the canvas middle; the canvas resolves where that is. */
  function claimCentre() {
    setPending({
      kind: "centre",
    });
  }

  /** Writes the new agent; the sphere appears only after the write. */
  async function createAgent(name: string, modelId: string) {
    // The middle is read at save time, when the canvas has its final width.
    const at =
      pending?.kind === "point"
        ? pending.at
        : (canvasRef.current?.centre() ?? {
            x: 0,
            y: 0,
          });
    const agentId = await writes.createAgent(name, modelId, at);

    setPending(null);
    setSelectedAgentId(agentId);
  }

  /** Deletion always asks first; the asked-about agent is selected. */
  function requestDelete(agentId: string) {
    setSelectedAgentId(agentId);
    setPending(null);
    setArmedAgentId(agentId);
  }

  /** The question's yes: the agent goes, and its links with it. */
  function confirmDelete() {
    setArmedAgentId(null);

    if (doomedAgentId !== null) {
      void removeAgent(doomedAgentId);
    }
  }

  function dismissDelete() {
    setArmedAgentId(null);
  }

  /** What collapsing the panel clears: the selection, the claim and the question; the edits go with the selection. */
  function reset() {
    setSelectedAgentId(null);
    setPending(null);
    setArmedAgentId(null);
  }

  return {
    /** What the page hands the clipboard — a copy put down is selected, and no claim stands. */
    takePut: (agentId: string) => {
      setPending(null);
      setSelectedAgentId(agentId);
    },
    selectedAgentId,
    pending,
    doomedAgentId,
    select,
    claimPoint,
    claimCentre,
    createAgent,
    requestDelete,
    confirmDelete,
    dismissDelete,
    reset,
  };
}
