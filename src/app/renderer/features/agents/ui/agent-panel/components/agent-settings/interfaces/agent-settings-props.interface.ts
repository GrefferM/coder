import type {
  AgentCatalogue,
  AgentDraft,
  AgentPanelActs,
  AgentPresses,
  AgentStanding,
  AgentWriting,
} from "../../../../../interfaces";

/**
 * One agent's settings. It stands on the same five parts as the tab around it, save that its draft is
 * settled — a tab with none is the form that makes a sphere, and never these settings.
 */
export interface AgentSettingsProps {
  /** The id of the agent being edited, so it is not offered itself as a tool; nothing while a sphere is made. */
  agentId: string | null;
  draft: AgentDraft;
  catalogue: AgentCatalogue;
  writing: AgentWriting;
  standing: AgentStanding;
  presses: AgentPresses;
  acts: AgentPanelActs;
  openGrantId: string | null;
  onOpenGrantChange: (grantId: string | null) => void;
}
