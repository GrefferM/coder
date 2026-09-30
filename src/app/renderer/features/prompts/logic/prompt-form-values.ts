import { EMPTY_PROMPT_FORM_VALUES } from "../constants";
import type { ProjectPrompt } from "../../../interfaces";
import type { PromptFormValues } from "../interfaces";

/** A saved prompt as the editor holds it, or empty fields for a new one. */
export function promptFormValues(prompt: ProjectPrompt | null): PromptFormValues {
  if (prompt === null) {
    return EMPTY_PROMPT_FORM_VALUES;
  }

  return {
    name: prompt.name,
    text: prompt.text,
  };
}
