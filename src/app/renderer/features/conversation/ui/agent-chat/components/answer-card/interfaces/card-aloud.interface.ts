/** The speaker over an answer: whether this card is the one being read, and the press that reads it or stops it. */
export interface CardAloud {
  isReading: boolean;
  onPress: () => void;
}
