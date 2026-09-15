import { changedFieldsSentence } from "./changed-fields-sentence";
import { CHANGED_FIELDS_NOTE_LEAVE_TAIL } from "../constants";

/** The leave-question line — what changed plus the leave tail; no changes gives an empty string. */
export function changedFieldsNote(labels: string[]): string {
  const sentence = changedFieldsSentence(labels);

  return sentence === "" ? "" : `${sentence}${CHANGED_FIELDS_NOTE_LEAVE_TAIL}`;
}
