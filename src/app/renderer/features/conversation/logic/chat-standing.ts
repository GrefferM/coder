import { CHAT_SAID_NOTHING_NOTE, CHAT_STOPPED_NOTE, NOT_STARTED_ENDS } from "../constants";
import { RUN_DONE, RUN_STEP_FAILED, RUN_STEP_SILENT, RUN_STEP_STOPPED, runStanding } from "../../record";
import type { ChatMessage } from "../interfaces";

/**
 * How the conversation on screen stands, in the words the history uses — said once here so the dot over the live
 * stream and the dot in the row cannot drift apart.
 *
 * Every turn of the last walk is read, not the one that came back last: turns run beside each other and finish in
 * any order, so a fall must not hide behind an answer that came after it. A repeat is a walk of its own, so a
 * fall it has mended is not read again. Which word the walk comes to is `runStanding`'s rule, not this one's.
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

/** The end word this turn would have been written into the record with. */
function endOf(message: ChatMessage): string {
  // The family names its own end word for each reason, and that is the word the record would keep.
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
