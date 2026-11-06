import type { SpokenWord } from "../../../../../../speech";

/** The speaker over an answer: whether this card is the one being read, and the press that reads it or stops it. */
export interface CardAloud {
  isReading: boolean;
  /** The word being read in this card, lit in its words; `null` while it is not read or before the first word. */
  spoken: SpokenWord | null;
  onPress: () => void;
}
