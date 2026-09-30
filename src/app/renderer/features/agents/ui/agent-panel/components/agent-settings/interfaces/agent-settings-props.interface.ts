import type {
  AgentCatalogue,
  AgentDraft,
  AgentPanelActs,
  AgentPresses,
  AgentStanding,
  AgentWriting,
} from "../../../../../interfaces";

/** One agent's settings; the same parts as the surrounding tab, but the draft is always set. */
export interface AgentSettingsProps {
  /** The edited agent's id, so it is not offered itself as a tool; null while a sphere is made. */
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
