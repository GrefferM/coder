/**
 * What the person has already been shown, and what still waits to be. One word is news once, and only
 * where it is not — a word standing in the stream on screen has been shown by standing there.
 */
export interface NewsSeen {
  /** Whether a word waiting for the hand stands in a conversation that is not the one on screen. */
  isNewsElsewhere: boolean;
  /** The history was opened — from here on this is no news, whether or not the cause was mended. */
  readNews: () => void;
}
