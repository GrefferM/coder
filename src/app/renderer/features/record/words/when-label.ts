import { RUN_HISTORY_SEPARATOR } from "../constants";
import { lastWord } from "../logic";
import { spanLabel, timeLabel } from "../../../utils/dates";
import type { RunRow } from "../interfaces";

/**
 * The hour the flow last spoke (the reply, or the question still out) and beside it the work: every written step added
 * up, not the wait. The list is sorted by that hour.
 */
export function whenLabel(run: RunRow): string {
  const when = timeLabel(lastWord(run));

  // A flow that sent nothing shows the hour alone, with no «0 с».
  return run.worked === 0 ? when : `${when}${RUN_HISTORY_SEPARATOR}${spanLabel(run.worked)}`;
}
