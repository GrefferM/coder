/** What the person has been shown; a word is news once, and only off the on-screen stream. */
export interface NewsSeen {
  /** A word waiting for the hand stands in a conversation not on screen. */
  isNewsElsewhere: boolean;
  /** The history was opened, so its news is read. */
  readNews: () => void;
}
