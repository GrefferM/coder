/** An agent's state line — label, colour, mark in the dot's place, and the optional moment. */
export interface AgentState {
  label: string;
  color: string;
  /** `clock` is a turn that is out, counted from its start; `sign` is the «?» of an agent that cannot start. */
  mark: "dot" | "clock" | "sign";
  at: Date | null;
}
