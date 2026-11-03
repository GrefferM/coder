import { levelsOf } from "../../../../../contracts";
import type { ChatMessage } from "../interfaces";

/** Each stream turn's step in the walk by `levelsOf`; this picks which cards are turns and which steps feed them. */
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
