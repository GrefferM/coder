import { NOT_STARTED_ENDS } from "../constants";
import type { TurnAnswer, TurnLength } from "../interfaces";
import type { NotStartedReason } from "../../../interfaces";

/**
 * A turn that never began — no attempt, no cost and not a fall. Each reason of the family is an end of its
 * own, and the card carries its own words.
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
    state: NOT_STARTED_ENDS[notStarted].state,
    calls: [],
  };
}
