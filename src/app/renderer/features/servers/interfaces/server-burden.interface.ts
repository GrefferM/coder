/** What goes with a server, counted where countable. */
export interface ServerBurden {
  /** How many grants on this server's functions the agents hold in all. */
  grants: number;
  /** How many agents those grants belong to. */
  agents: number;
  /** Whether this machine holds a token for it. */
  hasToken: boolean;
  /** How many of its declared variables this machine holds a value for. */
  values: number;
}
