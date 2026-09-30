import type { RunHit } from "../../record";
import type { ChatMessage } from "../interfaces";

/**
 * The message a hit names, by place, not by time: the hit's step, or else the person's own card in that question's
 * block; null when the stream lacks it.
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
