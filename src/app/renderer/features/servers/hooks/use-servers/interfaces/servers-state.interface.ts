import type { McpLook } from "../../../../../interfaces";

/** What every declared server said this time, and the two ways to ask again. */
export interface ServersState {
  /** By server id — the one handle there is on a server. */
  looks: Record<string, McpLook>;
  /**
   * Servers being asked right now, each with the moment its ask began — a row says «ЗАПУСКАЄТЬСЯ»
   * while its id stands here, and counts a clock up from the moment.
   */
  askingSince: Record<string, number>;
  /** Asks one server again, without letting go of it first. */
  look: (serverId: string) => void;
  /** «ЗАПУСТИТИ»: lets the server go and asks it afresh. */
  restart: (serverId: string) => void;
  /** «СКАСУВАТИ»: gives the place back at once — the process is let go and nothing is asked. */
  cancel: (serverId: string) => void;
  /** This server's page was opened, so the news of «34 → 33» has been read and goes out. */
  seen: (serverId: string) => void;
}
