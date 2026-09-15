import type { ChatMessage } from "../interfaces";

/**
 * The messages of this stream the word stands in, **freshest first**: a word is looked for to reach the last
 * place it was said, so the walk goes from there into the past.
 *
 * What the app itself says is not searched — a turn that never began, its word on a rule, the lines of a handoff.
 * Nobody was told those, and a search stopping on them would keep landing where nothing was said.
 *
 * A message is one place, not one per match inside it. The word is caught inside a word, and the case says nothing.
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

/** A question the person asked or an answer an agent gave — and nothing the app wrote in their place. */
function isSaid(message: ChatMessage): boolean {
  return (
    (message.from === "person" || message.from === "agent") && message.notStarted === null && message.note === null
  );
}

function holds(message: ChatMessage, looked: string): boolean {
  const said = [message.text, ...message.calls.flatMap((call) => [call.line, call.output])];

  return said.some((words) => words.toLocaleLowerCase().includes(looked));
}
