/**
 * How long a deletion can be undone. The undo line counts it down, and a deleted server's keys wait the same time
 * before leaving the machine, so ⌘Z restores the server with them.
 */
export const UNDO_STANDS_MS = 30_000;
