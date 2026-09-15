import type { RunHit } from "../../record";
import type { ChatMessage } from "../interfaces";

/**
 * The message a hit names, by place and never by hour. A hit in a step names that step; one naming no step is
 * the person's own card in that question's block. Nothing where the stream does not hold that message.
 */
export function foundMessage(messages: ChatMessage[], found: RunHit | null): string | null {
  if (found === null) {
    return null;
  }

  const said =
    found.stepId === null
      ? messages.find((message) => message.from === "person" && message.questionId === found.questionId)
      : messages.find((message) => message.stepId === found.stepId);

  return said?.id ?? null;
}
