import type { ChatActs } from "./chat-acts.interface";

/** The stream's hands that open a place and need no argument; the only ones a card's act may name. */
export type ChatWayOut = {
  [Hand in keyof ChatActs]: ChatActs[Hand] extends () => void ? Hand : never;
}[keyof ChatActs];
