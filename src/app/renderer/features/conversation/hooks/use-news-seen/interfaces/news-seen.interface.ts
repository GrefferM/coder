/**
 * What the person has been shown and what still waits; a word is news once, and only where it is not standing in the
 * on-screen stream.
 */
export interface NewsSeen {
  /** A word waiting for the hand stands in a conversation not on screen. */
  isNewsElsewhere: boolean;
  /** The history was opened; no longer news. */
  readNews: () => void;
}
