import type { AgentPress, ToolsPress } from "../../../../../features/agents";
import type { AgentDrafting, AgentMend, AgentSelection, AgentState } from "../../../../../features/agents";
import type { Agent, McpLook, OpenProject, ProviderState } from "../../../../../interfaces";

export interface AgentsSectionProps {
  project: OpenProject;
  /** What every declared server hands over now, so its functions can be given. */
  looks: Record<string, McpLook>;
  agents: AgentSelection;
  drafted: AgentDrafting;
  /** The selected agent's state, worked out once for the page. */
  state: AgentState;
  providers: ProviderState[];
  /** The agents whose lines come into this one. */
  suppliers: Agent[];
  /** The agents this one's lines lead to. */
  followers: Agent[];
  /** When the turn this agent is working began; null while it is not working. */
  startedAt: number | null;
  isNamingCopy: boolean;
  /** Which place of the tab a card's act named. */
  mending: AgentMend | null;
  /** The head the arc named, lit briefly when the tab opens on it. */
  toolsPress: ToolsPress | null;
  /** The press on the sphere itself, which returns the tab to the agent's settings. */
  agentPress: AgentPress | null;
  onCollapse: () => void;
  onRevert: () => void;
  onDeleteAgent: (agentId: string) => void;
}
