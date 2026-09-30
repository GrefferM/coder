import { useEffect, useState } from "react";
import { SERVER_GROUP_PREFIX } from "../../../../../../../../constants";
import type { AgentPress, ToolsPress } from "../../../../../../interfaces";

/**
 * Which step of the tools tab is open: the arc sends the tab to a step, the sphere brings it back.
 *
 * A mark on the arc goes to its own page; only the grey rest lands on the section. A grant opens above this tab and a
 * server here.
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

    /** One press, one step: the other stands down. */
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

    // The grey rest is no source: it opens the tab itself, so both steps stand down.
    setOpenServerId(null);
    onOpenGrant(null);
  }, [press]);

  /** A press on the agent's own sphere returns the tab to its root from any step. */
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
