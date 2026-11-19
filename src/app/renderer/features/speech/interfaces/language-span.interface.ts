/** A run of the spoken text in one language: where it starts and ends, and whether it is Ukrainian. */
export interface LanguageSpan {
  start: number;
  end: number;
  isUkrainian: boolean;
}
