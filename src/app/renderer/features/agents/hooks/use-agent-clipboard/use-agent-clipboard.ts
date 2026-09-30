import { useState } from "react";
import { freePlaceNear } from "../../../../utils/math";
import type { AgentClipboard } from "./interfaces";
import type { OpenProject } from "../../../../interfaces";
import type { PastedAgent } from "../../../../interfaces";
import type { AgentWrites } from "../use-agent-writes";
import type { Point } from "../../../../utils/math";

/** The copied agent, held by id; the pasted copy carries its mark until taken off, and the original stays held. */
export function useAgentClipboard(project: OpenProject, writes: AgentWrites): AgentClipboard {
  // The agent held for copying, by its own id.
  const [copiedAgentId, setCopiedAgentId] = useState<string | null>(null);
  const [pasted, setPasted] = useState<PastedAgent | null>(null);

  /** Puts the copy at the point and marks it as a copy; selection is the page's. */
  async function putCopyAt(at: Point): Promise<string | null> {
    if (copiedAgentId === null) {
      return null;
    }

    const copy = await writes.pasteAgent(copiedAgentId, at);

    if (copy === null) {
      return null;
    }

    setPasted(copy);

    return copy.agentId;
  }

  return {
    pasted,
    isPasteOffered: project.config.agents.some((agent) => agent.id === copiedAgentId),
    copy: setCopiedAgentId,
    putCopyAt,
    pasteBesideSource: async () => {
      const source = project.config.agents.find((agent) => agent.id === copiedAgentId);

      return source === undefined ? null : putCopyAt(freePlaceNear(source, project.config.agents));
    },
    /** Takes the copy's mark off the sphere just pasted. */
    dismissPasted: () => setPasted(null),
  };
}
