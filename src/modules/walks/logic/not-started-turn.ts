import { NOT_STARTED_STATES } from "../../../contracts";
import type { NotStartedReason, TurnAnswer, TurnLength } from "../../../contracts";

/**
 * A turn that never began: no attempt, no cost, not a fall. Each reason is an end of its own and the card carries its
 * own words.
 */
export function notStartedTurn(
  text: string,
  notStarted: NotStartedReason,
  wouldGo: TurnLength | null = null,
): TurnAnswer {
  return {
    text,
    note: null,
    cost: null,
    // Nothing was sent, so no ceiling stood over it.
    answerCeiling: null,
    isFailure: false,
    fell: null,
    isCut: false,
    notStarted,
    wouldGo,
    state: NOT_STARTED_STATES[notStarted],
    calls: [],
    compressed: null,
    toolMemories: [],
    route: null,
  };
}
