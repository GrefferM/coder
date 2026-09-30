import { joinedLabels } from "../../../utils/text";
import { CHANGED_FIELDS_NOTE_HEAD_TAIL } from "../constants";

/** The opening sentence shared by both question variants, fields as objects. */
export function changedFieldsSentence(labels: string[]): string {
  if (labels.length === 0) {
    return "";
  }

  const names = joinedLabels(labels);

  return `${names.charAt(0).toUpperCase()}${names.slice(1)} ${CHANGED_FIELDS_NOTE_HEAD_TAIL}`;
}
