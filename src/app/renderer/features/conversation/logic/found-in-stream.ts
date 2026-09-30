import type { ChatMessage } from "../interfaces";

/**
 * Messages of this stream containing the word, freshest first; one hit per message, substring and case-insensitive.
 * What the app itself says (a turn that never began, a rule's word, handoff lines) is not searched.
 */
export function foundInStream(messages: ChatMessage[], query: string): string[] {
  const looked = query.trim().toLocaleLowerCase();

  if (looked === "") {
    return [];
  }

  return messages
    .filter((message) => isSaid(message) && holds(message, looked))
    .map((message) => message.id)
    .reverse();
}

/** A question the person asked or an answer an agent gave, not an app-written card. */
function isSaid(message: ChatMessage): boolean {
  return (
    (message.from === "person" || message.from === "agent") && message.notStarted === null && message.note === null
  );
}

function holds(message: ChatMessage, looked: string): boolean {
  const said = [message.text, ...message.calls.flatMap((call) => [call.line, call.output])];

  return said.some((words) => words.toLocaleLowerCase().includes(looked));
}
