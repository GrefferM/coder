import { RUN_DONE, RUN_FAILED, RUN_NOT_SENT, RUN_STOPPED } from "../constants";
import { RUN_STEP_NOT_SENT_ENDS } from "../../../../../contracts";

/**
 * The word a flow wears, worked out from how its turns ended. The one place on this side that owns the
 * order, so the row, the pass of the projection and the band over the stream cannot say three different things about
 * one walk. The reader keeps its own copy of the same rule on the other side of the bridge, where this code cannot go.
 *
 * «ГОТОВО» stands only where every turn answered. Where some did not, the worse word wins: «УПАВ» before «НЕ ПІШОВ»,
 * because a turn that was sent and broke is news of a kind a turn that never left can never be. A hand
 * explains only what it stopped, so a stop alone is «ЗУПИНЕНО» and a stop beside anything else says the other thing.
 * An end word nobody here knows is a new end and not a gentle one, so it counts as a fall.
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
