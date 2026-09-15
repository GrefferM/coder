/** One prior turn: who said it, and what. */
export interface ChatTurn {
  from: "person" | "agent";
  text: string;
}
