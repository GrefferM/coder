import { RECORD_UNREAD_NOTE, RUN_STEP_FAILED, recordNote } from "../../../contracts";
import type { TurnAnswer } from "../../../contracts";

/** A turn that fell before the model was asked: its memory could not be read from the record. */
export function unreadTurn(failure: string): TurnAnswer {
  return {
    text: "",
    note: recordNote(RECORD_UNREAD_NOTE, failure),
    cost: null,
    answerCeiling: null,
    isFailure: true,
    fell: failure,
    isCut: false,
    notStarted: null,
    wouldGo: null,
    state: RUN_STEP_FAILED,
    calls: [],
    compressed: null,
    toolMemories: [],
  };
}
