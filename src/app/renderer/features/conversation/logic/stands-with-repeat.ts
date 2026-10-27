import { isRouteStop } from "../../../../../contracts";
import type { ChatMessage } from "../interfaces";

/**
 * Whether «СПИТАТИ ЩЕ РАЗ» stands under this word: only under an accident (the app's word about a broken turn, a turn
 * that never began, a link the work could not go down), not under an answer, nor under a line the agent itself chose
 * not to take.
 */
export function standsWithRepeat(said: ChatMessage): boolean {
  return said.note !== null || said.notStarted !== null || (said.stopReason !== null && !isRouteStop(said.stopReason));
}
