import { SAY_WALK_AGAIN_CHANNEL } from "../../../../../contracts";
import type { ChatMessage } from "../../../../../contracts";

/** «СПИТАТИ ЩЕ РАЗ» under one card. */
export async function sayWalkAgain(said: ChatMessage): Promise<void> {
  return window.electronApi.invoke(SAY_WALK_AGAIN_CHANNEL, {
    said,
  });
}
