/** One line of a server's page: a function the server hands over now. «N АГ.» is a count, not a tick. */
export interface FunctionRow {
  name: string;
  /** The server's own words about it. */
  description: string;
  /** How many agents hold this function; zero is not shown. */
  agents: number;
}
