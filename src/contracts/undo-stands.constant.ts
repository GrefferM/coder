/**
 * How long a deletion can be taken back. One promise, so one number: the undo line counts these seconds down on
 * the screen, and the keys of a deleted server wait out the very same ones before they leave this machine, since
 * ⌘Z must hand a server back **with** them. Two copies of it would agree until the day one of them is corrected,
 * and then ⌘Z would return a server whose token had already gone.
 */
export const UNDO_STANDS_MS = 30_000;
