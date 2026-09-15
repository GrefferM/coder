import { isOnScreen } from "./is-on-screen";
import type { ChatMessage, WalkState } from "../interfaces";

/**
 * One block per question, in the order the questions were asked, each block's words in the order they were
 * said. Two questions of one millisecond are still two blocks: the id keeps them apart where the clock cannot.
 */
export function inStreamOrder(messages: ChatMessage[]): ChatMessage[] {
  return [...messages].sort(
    (one, other) =>
      one.askedAt - other.askedAt || one.questionId.localeCompare(other.questionId) || one.at.localeCompare(other.at),
  );
}

/**
 * One stream for the whole project — every agent's turns of the walks standing on this screen, in
 * order, without what arrived down a line. A walk of another row is another conversation, and says nothing here.
 */
export function chatStream(walk: WalkState): ChatMessage[] {
  return inStreamOrder(
    Object.entries(walk.walks)
      .filter(([runKey]) => isOnScreen(walk, runKey))
      .flatMap(([, held]) => held.said)
      .filter((message) => message.from !== "supplier"),
  );
}
