import type { AgentPress, ToolsPress } from "../../../../../features/agents";
import type { AgentMend } from "../../../../../features/agents";

/** Which section of the rail stands open, whether the panel is put away, and every way of moving between them. */
export interface RailStanding {
  activeSectionId: string;
  isCollapsed: boolean;
  /** Whether the open panel is the selected agent's own: the rest dim, and an empty-canvas click lets it go. */
  isPanelOnAgent: boolean;
  /** Whether the chat stands open; only then does the canvas say where a question would go. */
  isChatOpen: boolean;
  /** Which place of the agent's tab the card's act named, or null when nothing named one. */
  agentMend: AgentMend | null;
  /** The head of the agent's tools a press on the arc named; nothing where none was named. */
  toolsPress: ToolsPress | null;
  openAgentsSection: () => void;
  /** «ПОКАЗАТИ ВИКЛИК» is answered in the chat, so the rail goes there — the call is not in a catalogue. */
  openChat: () => void;
  /** The create form lives in the agents section, so asking for it moves the rail there. */
  openAgentForm: () => void;
  closeAgentsSection: () => void;
  /** A card's act goes to the agent's tab and opens it on the place that card named. */
  openAgentAt: (place: AgentMend) => void;
  /** The arc was pressed — the agent's tab opens on its tools, on that source's head. */
  openAgentTools: (group: string | null, grantId: string | null) => void;
  /** The press on the agent's own sphere, which stands its tab back at the settings. */
  openAgentSelf: (agentId: string) => void;
  agentPress: AgentPress | null;
  /** The model an agent stands on, opened on its own form — where the ceiling is written. */
  openAgentModel: (agentId: string | null) => void;
  /** An installed, undeclared model is taken up with its name and provider already in the form. */
  takeUpModel: (providerId: string, title: string) => void;
  handleActiveIdChange: (sectionId: string) => void;
  handleCollapsedChange: (isCollapsed: boolean) => void;
}
