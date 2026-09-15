import type { RefObject } from "react";
import type { AgentDraft, WasAgent } from "../../../../../../../interfaces";
import type { Agent, ProjectModel, ProjectPrompt } from "../../../../../../../../../interfaces";

export interface SettingsTiesProps {
  draft: AgentDraft;
  /** What each of these was before the draft changed it. */
  was: WasAgent;
  models: ProjectModel[];
  prompts: ProjectPrompt[];
  /** The other agents, so a picker can say how many of them stand on the same thing. */
  agents: Agent[];
  /** The model the project no longer has, or a provider nobody declared. */
  isModelGone: boolean;
  isPromptGone: boolean;
  goneProviderId: string | null;
  /** The field a mended card points at, so the panel opens with the eye already on it. */
  mendedField: RefObject<HTMLButtonElement | null> | undefined;
  onDraftChange: (patch: Partial<AgentDraft>) => void;
}
