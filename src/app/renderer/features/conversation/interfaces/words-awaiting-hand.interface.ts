/** Words awaiting a hand, split by whether the person has them in front of them. */
export interface WordsAwaitingHand {
  /** In a conversation not on screen; drives the dot on «ІСТОРІЯ». */
  elsewhere: string[];
  /** In the stream being read, so already shown. */
  onScreen: string[];
}
