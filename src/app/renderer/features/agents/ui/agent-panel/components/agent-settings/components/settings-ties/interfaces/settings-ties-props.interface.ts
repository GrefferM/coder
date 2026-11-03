import type { RefObject } from "react";
import type { AgentDraft, WasAgent } from "../../../../../../../interfaces";
import type { Agent, ProjectModel, ProjectPrompt } from "../../../../../../../../../interfaces";

export interface SettingsTiesProps {
  draft: AgentDraft;
  /** What each of these was before the draft changed it. */
  was: WasAgent;
  models: ProjectModel[];
  prompts: ProjectPrompt[];
  /** The other agents, so a picker can count how many share a choice. */
  agents: Agent[];
  /** The model is gone from the project; a provider unknown to the app is `goneProviderId`. */
  isModelGone: boolean;
  isPromptGone: boolean;
  goneProviderId: string | null;
  /** The chosen model's provider, by name, where it is turned off on this machine. */
  offProviderName: string | null;
  /** The models standing on a provider turned off on this machine. */
  offModelIds: string[];
  /** The field a mended card points at, focused on open. */
  mendedField: RefObject<HTMLButtonElement | null> | undefined;
  onDraftChange: (patch: Partial<AgentDraft>) => void;
}
