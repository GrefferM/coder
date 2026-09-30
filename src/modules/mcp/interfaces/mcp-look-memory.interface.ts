/** What this machine remembers of the last look at one server; machine-local, not in the project file. */
export interface McpLookMemory {
  /** The server's own id, never its name. */
  serverId: string;
  /** The names it handed over when written, so the next look can tell a changed list from the same one. */
  names: string[];
  /** When the list last differed from what was held; `null` until it has differed once. */
  changedAt: number | null;
  /** How many it handed over before the change, while the news is unread. */
  wasCount: number | null;
}
