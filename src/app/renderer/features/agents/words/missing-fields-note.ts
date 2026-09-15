import { joinedLabels } from "../../../utils/text";
import { MISSING_FIELDS_NOTE_PREFIX, MISSING_FIELDS_NOTE_SUFFIX } from "../constants";

/** The question when «Зберегти» cannot be given: the box names the empty fields and offers no write. */
export function missingFieldsNote(labels: string[]): string {
  return `${MISSING_FIELDS_NOTE_PREFIX}${joinedLabels(labels)}${MISSING_FIELDS_NOTE_SUFFIX}`;
}
