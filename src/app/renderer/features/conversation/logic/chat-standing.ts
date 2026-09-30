import { CHAT_SAID_NOTHING_NOTE, CHAT_STOPPED_NOTE, NOT_STARTED_ENDS } from "../constants";
import { RUN_DONE, RUN_STEP_FAILED, RUN_STEP_SILENT, RUN_STEP_STOPPED, runStanding } from "../../record";
import type { ChatMessage } from "../interfaces";

/**
 * How the conversation on screen stands, in the history's words, shared by the live-stream dot and the row dot. Every
 * turn of the last walk is read, not just the last to return; the walk's word is `runStanding`'s rule.
 */
export function chatStanding(messages: ChatMessage[]): string {
  const last = messages.findLast((message) => message.from === "agent") ?? null;

  if (last === null) {
    return RUN_DONE;
  }

  // A word with no walk of its own stands for itself.
  const walk =
    last.walkId === null
      ? [last]
      : messages.filter((message) => message.from === "agent" && message.walkId === last.walkId);

  return runStanding(walk.map((message) => endOf(message)));
}

/** The end word this turn would be recorded with. */
function endOf(message: ChatMessage): string {
  // The family names its own end word per reason; that is the recorded word.
  if (message.notStarted !== null) {
    return NOT_STARTED_ENDS[message.notStarted].state;
  }

  if (message.note === CHAT_STOPPED_NOTE) {
    return RUN_STEP_STOPPED;
  }

  if (message.note === CHAT_SAID_NOTHING_NOTE) {
    return RUN_STEP_SILENT;
  }

  return message.isFailure || message.note !== null ? RUN_STEP_FAILED : RUN_DONE;
}
