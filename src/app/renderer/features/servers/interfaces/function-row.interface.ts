/**
 * One line of a server's page — a function the server hands over **now**, and nothing else. A grant pointing at
 * a name it no longer gives is the agent's trouble, told in the agent's own tab. Nothing is mended or handed
 * out from here: «N АГ.» is a count and not a tick.
 */
export interface FunctionRow {
  name: string;
  /** The server's own words about it. */
  description: string;
  /** How many agents hold this very function; a function nobody holds says nothing rather than a zero. */
  agents: number;
}
