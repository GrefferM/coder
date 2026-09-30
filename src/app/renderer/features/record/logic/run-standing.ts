import { RUN_DONE, RUN_FAILED, RUN_NOT_SENT, RUN_STOPPED } from "../constants";
import { RUN_STEP_NOT_SENT_ENDS } from "../../../../../contracts";

/**
 * The word a flow wears, from how its turns ended; the single owner of the order here (the reader keeps its own copy
 * across the bridge).
 *
 * «ГОТОВО» only where every turn answered; otherwise the worse word wins, «УПАВ» before «НЕ ПІШОВ». A stop alone is
 * «ЗУПИНЕНО»; beside anything else it yields. An unknown end word counts as a fall.
 */
export function runStanding(ends: string[]): string {
  const unanswered = ends.filter((end) => end !== RUN_DONE);

  if (unanswered.length === 0) {
    return RUN_DONE;
  }

  if (unanswered.every((end) => end === RUN_STOPPED)) {
    return RUN_STOPPED;
  }

  return unanswered.every((end) => end === RUN_STOPPED || RUN_STEP_NOT_SENT_ENDS.includes(end))
    ? RUN_NOT_SENT
    : RUN_FAILED;
}
