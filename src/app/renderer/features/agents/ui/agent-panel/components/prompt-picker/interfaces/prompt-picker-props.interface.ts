import type { RefObject } from "react";
import type { Agent, ProjectPrompt } from "../../../../../../../interfaces";

/** `promptId` is `null` for a promptless agent; counts are read from `agents`. */
export interface PromptPickerProps {
  prompts: ProjectPrompt[];
  agents: Agent[];
  promptId: string | null;
  isChanged?: boolean;
  /** The agent's prompt has lost its file: the field says so instead of «без промпта». */
  isLost?: boolean;
  /** The field itself, receiving the cursor from «ВІДКРИТИ ПРОМПТ». */
  fieldRef?: RefObject<HTMLButtonElement | null>;
  onPromptIdChange: (promptId: string | null) => void;
}
