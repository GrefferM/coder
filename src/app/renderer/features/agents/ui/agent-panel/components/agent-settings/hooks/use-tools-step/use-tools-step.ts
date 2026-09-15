import { useEffect, useState } from "react";
import { SERVER_GROUP_PREFIX } from "../../../../../../../../constants";
import type { AgentPress, ToolsPress } from "../../../../../../interfaces";

/**
 * Which step of the tools tab stands open: the arc sends the tab to a step, the sphere brings it back.
 *
 * A mark on the arc stands for one thing and names it, so a press goes straight to that thing's own page. Only
 * the grey rest lands on the section — it stands for no one thing, and there is nothing else for it to open.
 *
 * A grant is opened above this tab and a server here, because a card can send somebody to a grant from outside
 * and nothing outside sends anybody to a server.
 */
export function useToolsStep(
  press: ToolsPress | null,
  agentPress: AgentPress | null,
  onOpenGrant: (grantId: string | null) => void,
): {
  openServerId: string | null;
  openServer: (serverId: string | null) => void;
} {
  const [openServerId, setOpenServerId] = useState<string | null>(null);

  useEffect(() => {
    if (press === null) {
      return;
    }

    /**
     * One press, one step: the other one always stands down. The canvas stays in sight while a step is open, so a
     * press can arrive on a server's mark while a grant is open and the other way round — and two steps at once
     * would have shown whichever the tab happens to ask about first.
     */
    if (press.grantId !== null) {
      setOpenServerId(null);
      onOpenGrant(press.grantId);

      return;
    }

    if (press.group !== null && press.group.startsWith(SERVER_GROUP_PREFIX)) {
      onOpenGrant(null);
      setOpenServerId(press.group.slice(SERVER_GROUP_PREFIX.length));

      return;
    }

    // The grey rest is the rest and not a source: it opens the tab itself, so both steps stand down.
    setOpenServerId(null);
    onOpenGrant(null);
  }, [press]);

  /**
   * A press on the agent's own sphere stands the tab back at its root. The sphere is the agent, and the
   * agent is these settings — a step is a place inside them, and the canvas stays in sight while one is open, so
   * the sphere is the way back from a step just as it is the way to the agent from anywhere else.
   */
  useEffect(() => {
    if (agentPress === null) {
      return;
    }

    setOpenServerId(null);
    onOpenGrant(null);
  }, [agentPress]);

  return {
    openServerId,
    openServer: setOpenServerId,
  };
}
