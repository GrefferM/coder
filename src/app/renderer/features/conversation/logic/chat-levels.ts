import { levelsOf } from "../../../../../contracts";
import type { ChatMessage } from "../interfaces";

/**
 * The step of the walk each stream turn stands on; the rule is `levelsOf`'s, this only picks which cards are turns and
 * which steps feed them.
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
