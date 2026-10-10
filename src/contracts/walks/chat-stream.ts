import { isOnScreen } from "./is-on-screen";
import type { ChatMessage } from "./chat-message.interface";
import type { WalkSnapshot } from "./walk-snapshot.interface";

/**
 * One block per question in the order asked, each block's words in the order said; the id separates questions of the
 * same millisecond.
 */
export function inStreamOrder(messages: ChatMessage[]): ChatMessage[] {
  return [...messages].sort(
    (one, other) =>
      one.askedAt - other.askedAt || one.questionId.localeCompare(other.questionId) || one.at.localeCompare(other.at),
  );
}

/**
 * One stream for the project: every agent's turns of the walks standing on this screen, in order, without what arrived
 * down a line; walks of another row are another conversation.
 */
export function chatStream(walk: WalkSnapshot): ChatMessage[] {
  return inStreamOrder(
    Object.entries(walk.walks)
      .filter(([runKey]) => isOnScreen(walk, runKey))
      .flatMap(([, held]) => held.said)
      .filter((message) => message.from !== "supplier"),
  );
}
