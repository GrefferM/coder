import type { ChatActs } from "./chat-acts.interface";

/**
 * The hands of the stream that open a place and ask for nothing — the only ones a card's act may name.
 * A hand that needs a word, like asking one message again, is not a way out, and the table cannot hold it.
 */
export type ChatWayOut = {
  [Hand in keyof ChatActs]: ChatActs[Hand] extends () => void ? Hand : never;
}[keyof ChatActs];
