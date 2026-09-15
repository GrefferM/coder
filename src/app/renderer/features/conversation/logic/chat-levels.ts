import { levelsOf } from "../../../../../contracts";
import type { ChatMessage } from "../interfaces";

/**
 * Which step of the walk each turn of the stream stands on. The rule is `levelsOf`'s; what belongs here is which
 * cards are turns at all — the app's own sentences are not — and that a turn is fed by the steps it names.
 */
export function chatLevels(messages: ChatMessage[]): Record<string, number> {
  const said = messages.filter((message) => message.from === "agent");

  return levelsOf(
    said.map((message) => ({
      id: message.id,
      at: message.stepId,
      fedBy: message.fedBy,
    })),
  );
}
