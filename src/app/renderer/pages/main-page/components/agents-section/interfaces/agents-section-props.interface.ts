import type { AgentPress, ToolsPress } from "../../../../../features/agents";
import type { AgentDrafting, AgentMend, AgentSelection, AgentState } from "../../../../../features/agents";
import type { Agent, McpLook, OpenProject, ProviderState } from "../../../../../interfaces";

export interface AgentsSectionProps {
  project: OpenProject;
  /** What every declared server hands over right now, so its functions can be given. */
  looks: Record<string, McpLook>;
  agents: AgentSelection;
  drafted: AgentDrafting;
  /** The state of the selected agent, worked out once for the whole page. */
  state: AgentState;
  providers: ProviderState[];
  /** The agents whose lines come into this one. */
  suppliers: Agent[];
  /** When the turn this agent is working began; null while it is not working. */
  startedAt: number | null;
  isNamingCopy: boolean;
  /** Which place of the tab a card's act named. */
  mending: AgentMend | null;
  /** The head the arc named, lit for a moment when the tab opens on it. */
  toolsPress: ToolsPress | null;
  /** The press on the sphere itself, which stands the tab back at the agent's settings. */
  agentPress: AgentPress | null;
  onCollapse: () => void;
  onRevert: () => void;
  onDeleteAgent: (agentId: string) => void;
}
