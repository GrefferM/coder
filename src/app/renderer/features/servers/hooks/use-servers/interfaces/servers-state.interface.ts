import type { McpLook } from "../../../../../interfaces";

/** What each declared server said this time, and the two ways to ask again. */
export interface ServersState {
  /** By server id — the one handle there is on a server. */
  looks: Record<string, McpLook>;
  /** Servers being asked now, each with the moment its ask began; a row says «ЗАПУСКАЄТЬСЯ» while its id is here. */
  askingSince: Record<string, number>;
  /** Asks one server again, without letting go of it first. */
  look: (serverId: string) => void;
  /** «ЗАПУСТИТИ»: lets the server go and asks it afresh. */
  restart: (serverId: string) => void;
  /** «ЗУПИНИТИ»: releases a standing server's process; it stands unknown, and is not raised again by a change of its line. */
  stop: (serverId: string) => void;
  /** «СКАСУВАТИ»: releases the process and asks nothing. */
  cancel: (serverId: string) => void;
  /** The server's page was opened, so the «34 → 33» news has been read. */
  seen: (serverId: string) => void;
}
