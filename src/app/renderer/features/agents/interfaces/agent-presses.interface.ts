import type { AgentMend } from "./agent-mend.type";
import type { AgentPress } from "./agent-press.interface";
import type { ToolsPress } from "./tools-press.interface";

/** What sent the tab here, so it opens on the right step. */
export interface AgentPresses {
  /** Which place a card's act named, so the tab opens on it. */
  mending: AgentMend | null;
  tools: ToolsPress | null;
  /** The press on the sphere itself, which returns the tab to the agent's settings. */
  agent: AgentPress | null;
}
