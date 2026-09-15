import { ANSWER_BLANK_LINES_PATTERN, ANSWER_ONE_BLANK_LINE } from "./constants";

/** A model's answer trimmed, runs of blank lines collapsed to one; the words untouched. */
export function tidyAnswer(text: string): string {
  return text.trim().replace(ANSWER_BLANK_LINES_PATTERN, ANSWER_ONE_BLANK_LINE);
}
