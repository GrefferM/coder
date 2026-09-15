import type { ChatMessage } from "../interfaces";

/**
 * Whether «СПИТАТИ ЩЕ РАЗ» stands under this word. Only under an accident: the app's own word about a broken
 * turn, a turn that never began, a link the work could not go down. A turn that answered carries what it was
 * asked, which is not a reason to offer a repeat here.
 */
export function standsWithRepeat(said: ChatMessage): boolean {
  return said.note !== null || said.notStarted !== null || said.stopReason !== null;
}
