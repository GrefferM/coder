/** An agent's state line: label, colour, mark in the dot's place, optional moment. */
export interface AgentState {
  label: string;
  color: string;
  /** `clock` is a turn in progress, counted from its start; `sign` is the «?» of an agent that cannot start. */
  mark: "dot" | "clock" | "sign";
  at: Date | null;
}
