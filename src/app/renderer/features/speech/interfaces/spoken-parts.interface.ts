/** An answer as it is read aloud, and for each of its characters the place in the card's text it came from. */
export interface SpokenParts {
  spoken: string;
  /** The card's index of each spoken character; a pause standing for code has none. */
  origins: number[];
}
