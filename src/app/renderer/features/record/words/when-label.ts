import { RUN_HISTORY_SEPARATOR } from "../constants";
import { lastWord } from "../logic";
import { spanLabel, timeLabel } from "../../../utils/dates";
import type { RunRow } from "../interfaces";

/**
 * The hour the flow last spoke — the reply that came back, or the question still out — and beside it the
 * work itself, every written step of every question added up, not the wait. The list is sorted by that same
 * hour, so a row that rose to the top has to say why it rose; the hour it was asked would answer a question
 * nobody asked.
 */
export function whenLabel(run: RunRow): string {
  const when = timeLabel(lastWord(run));

  // A flow that sent nothing worked no time at all, and «0 с» would be a duration nobody spent.
  return run.worked === 0 ? when : `${when}${RUN_HISTORY_SEPARATOR}${spanLabel(run.worked)}`;
}
