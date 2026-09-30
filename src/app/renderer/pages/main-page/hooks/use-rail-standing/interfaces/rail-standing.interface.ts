import type { AgentPress, ToolsPress } from "../../../../../features/agents";
import type { AgentMend } from "../../../../../features/agents";

/** The open rail section, whether the panel is collapsed, and every way of moving between them. */
export interface RailStanding {
  activeSectionId: string;
  isCollapsed: boolean;
  /** Whether the open panel is the selected agent's: the rest dim, and an empty-canvas click closes it. */
  isPanelOnAgent: boolean;
  /** Whether the chat is open; only then does the canvas show where a question would go. */
  isChatOpen: boolean;
  /** The place in the agent's tab a card named, or null. */
  agentMend: AgentMend | null;
  /** The tools head an arc press named, or null. */
  toolsPress: ToolsPress | null;
  openAgentsSection: () => void;
  /** Goes to the chat, where «ПОКАЗАТИ ВИКЛИК» is answered. */
  openChat: () => void;
  /** Moves the rail to the agents section's create form. */
  openAgentForm: () => void;
  closeAgentsSection: () => void;
  /** Goes to the agent's tab, on the place the card named. */
  openAgentAt: (place: AgentMend) => void;
  /** Opens the agent's tab on its tools, on that source's head. */
  openAgentTools: (group: string | null, grantId: string | null) => void;
  /** Resets the agent's tab to its settings; from a press on the agent's sphere. */
  openAgentSelf: (agentId: string) => void;
  agentPress: AgentPress | null;
  /** Opens an agent's model on its own form, where the ceiling is written. */
  openAgentModel: (agentId: string | null) => void;
  /** Takes up an installed, undeclared model with name and provider prefilled. */
  takeUpModel: (providerId: string, title: string) => void;
  handleActiveIdChange: (sectionId: string) => void;
  handleCollapsedChange: (isCollapsed: boolean) => void;
}
