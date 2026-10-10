import type { WalkSnapshot } from "../../../../../contracts";

/** A conversation with nothing in it: what the screen holds until the backend tells it of a walk. */
export function emptyWalk(): WalkSnapshot {
  return {
    out: {},
    walks: {},
    saidAgain: [],
    flowRunId: null,
  };
}
