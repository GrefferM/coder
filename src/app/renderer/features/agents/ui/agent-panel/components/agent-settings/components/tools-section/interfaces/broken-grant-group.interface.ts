import type { BrokenGrantCause } from "../../../../../../../../../interfaces";

/** One row of a broken group: the name it still points at, and what the grant carries with it. */
export interface BrokenGrantRow {
  id: string;
  name: string;
  pinnedCount: number;
}

/**
 * One reason, its rows, and the source they stand under. The group is the reason and not the
 * source, because that is what the sentence under the rows says — «функції» against «сервера».
 */
export interface BrokenGrantGroup {
  key: string;
  cause: BrokenGrantCause;
  /** The server's own name while the project still names it; a server that is gone left no name behind, only an id. */
  serverName: string | null;
  rows: BrokenGrantRow[];
}
