import { RECORD_FAILURE_SEPARATOR } from "./record-failure.constant";
import { FAILURE_MARKUP, FAILURE_MAX_CHARS, plainFirstLine, shortLabel } from "../text";

/** The app's word where the record failed, then the record's own sentence, cut like any outside failure. */
export function recordNote(word: string, failure: string): string {
  const line = shortLabel(plainFirstLine(failure, FAILURE_MARKUP), FAILURE_MAX_CHARS);

  return line === "" ? word : `${word}${RECORD_FAILURE_SEPARATOR}${line}`;
}
