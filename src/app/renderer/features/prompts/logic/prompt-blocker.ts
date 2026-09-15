import { PROMPT_NAME_DROPPED_LABEL } from "../constants";
import type { PromptFormValues } from "../interfaces";

/** Only the name blocks a write; the text may be empty. */
export function promptBlocker(values: PromptFormValues): string[] {
  return values.name.trim() ? [] : [PROMPT_NAME_DROPPED_LABEL];
}
