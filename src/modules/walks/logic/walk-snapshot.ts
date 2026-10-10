import type { WalkSnapshot, WalkState } from "../../../contracts";

/** What the screen is told of the walks: their words and turns, not the writer's ledgers. */
export function walkSnapshot(state: WalkState): WalkSnapshot {
  return {
    out: state.out,
    walks: state.walks,
    saidAgain: state.saidAgain,
    flowRunId: state.flowRunId,
  };
}
