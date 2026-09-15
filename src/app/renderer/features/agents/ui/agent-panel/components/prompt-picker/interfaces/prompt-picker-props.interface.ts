import type { RefObject } from "react";
import type { Agent, ProjectPrompt } from "../../../../../../../interfaces";

/** `promptId` is `null` for a promptless agent; counts are read from `agents`. */
export interface PromptPickerProps {
  prompts: ProjectPrompt[];
  agents: Agent[];
  promptId: string | null;
  isChanged?: boolean;
  /** The prompt this agent names has lost its file, so the field says that instead of «без промпта». */
  isLost?: boolean;
  /** The field itself, so «ВІДКРИТИ ПРОМПТ» lands the cursor here. */
  fieldRef?: RefObject<HTMLButtonElement | null>;
  onPromptIdChange: (promptId: string | null) => void;
}
