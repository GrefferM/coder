import type { BrokenGrantCause } from "../../../../../../../../../interfaces";

/** One row of a broken group: the name it still points at, and what the grant carries. */
export interface BrokenGrantRow {
  id: string;
  name: string;
  pinnedCount: number;
}

/**
 * One reason, its rows, and their source; grouped by reason as the sentence under the rows differs («функції» vs
 * «сервера»).
 */
export interface BrokenGrantGroup {
  key: string;
  cause: BrokenGrantCause;
  /** The server's name while the project still names it; null for a gone server, which left only an id. */
  serverName: string | null;
  rows: BrokenGrantRow[];
}
