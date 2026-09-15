/** The words that wait for a hand, parted by whether the person has them in front of them. */
export interface WordsAwaitingHand {
  /** In a conversation not on screen — this is what the dot on «ІСТОРІЯ» says. */
  elsewhere: string[];
  /** In the stream the person is reading, so already shown and never news afterwards. */
  onScreen: string[];
}
