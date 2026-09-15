import { inStreamOrder } from "./chat-stream";
import { runStream } from "./run-stream";
import type { WholeRun } from "../../record";
import type { ChatMessage } from "../interfaces";

/**
 * The stream under an opened run: the record plus the live stream. A walk is read from one source only — the
 * live stream where it began there, the record otherwise. A live word belongs to the run its question names by
 * id, never by the hour it was said.
 */
export function openedStream(run: WholeRun, live: ChatMessage[]): ChatMessage[] {
  const questions = new Set(run.questions.map((question) => question.id));
  const said = live.filter((message) => questions.has(message.questionId));
  const liveWalks = new Set(said.flatMap((message) => (message.walkId === null ? [] : [message.walkId])));
  // A question the person asked here has its own card already; the record's copy of it is not a second.
  const askedLive = new Set(said.filter((message) => message.from === "person").map((message) => message.questionId));
  const recorded = runStream(run).filter(
    (message) =>
      !(message.walkId !== null && liveWalks.has(message.walkId)) &&
      !(message.from === "person" && askedLive.has(message.questionId)),
  );

  return inStreamOrder([...recorded, ...said]);
}
