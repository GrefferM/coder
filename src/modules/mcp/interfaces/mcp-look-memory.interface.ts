/**
 * What this machine remembers of the last look at one server. It is not in the project file —
 * «це спостереження, а не домовленість» — so it lives beside the record of runs and never travels with the folder.
 */
export interface McpLookMemory {
  /** The one handle there is on a server (the first rule): its own id, and never its name. */
  serverId: string;
  /** The names it handed over when this was written, so the next look can tell a changed list from the same one. */
  names: string[];
  /** When the list last differed from what was held; nothing at all until it has differed once. */
  changedAt: number | null;
  /** How many it handed over before that change, while the news of it still stands unread. */
  wasCount: number | null;
}
