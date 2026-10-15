export interface ChatTurn {
  from: "person" | "agent";
  text: string;
}
