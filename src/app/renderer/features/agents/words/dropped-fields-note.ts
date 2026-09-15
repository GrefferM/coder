import { changedFieldsSentence } from "./changed-fields-sentence";
import { CHANGED_FIELDS_NOTE_DROP_TAIL } from "../constants";

/** The line after «Скасувати» — the shared opening sentence plus the drop tail. */
export function droppedFieldsNote(labels: string[]): string {
  const sentence = changedFieldsSentence(labels);

  return sentence === "" ? "" : `${sentence}${CHANGED_FIELDS_NOTE_DROP_TAIL}`;
}
