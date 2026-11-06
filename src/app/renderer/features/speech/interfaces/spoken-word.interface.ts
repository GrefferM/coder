/** The word being read, as a range of the card's text, and how much of the reading is behind it, from 0 to 1. */
export interface SpokenWord {
  start: number;
  end: number;
  ratio: number;
}
