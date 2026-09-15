import {
  PROMPT_NAME_CHANGE_LABEL,
  PROMPT_NAME_DROPPED_LABEL,
  PROMPT_TEXT_CHANGE_LABEL,
  PROMPT_TEXT_DROPPED_LABEL,
  PROMPT_TEXT_LENGTH_SUFFIX,
} from "../constants";
import type { FieldChange } from "../../../interfaces";
import type { PromptFormValues } from "../interfaces";

/** A prompt's text as a character count for a diff line. */
function textLength(text: string): string {
  return `${text.length}${PROMPT_TEXT_LENGTH_SUFFIX}`;
}

/** Fields of a prompt's editor changed from the saved values. */
export function promptChanges(saved: PromptFormValues, form: PromptFormValues): FieldChange[] {
  const written: FieldChange[] = [
    {
      label: PROMPT_NAME_CHANGE_LABEL,
      droppedLabel: PROMPT_NAME_DROPPED_LABEL,
      was: saved.name,
      now: form.name,
    },
    {
      label: PROMPT_TEXT_CHANGE_LABEL,
      droppedLabel: PROMPT_TEXT_DROPPED_LABEL,
      was: textLength(saved.text),
      now: textLength(form.text),
    },
  ];

  return written.filter((change) => change.was !== change.now);
}
