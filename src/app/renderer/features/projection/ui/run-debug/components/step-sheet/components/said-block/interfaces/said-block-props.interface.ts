export interface SaidBlockProps {
  label: string;
  text: string;
  /** The turn's own words are bright; words that came in from another step are quieter. */
  isAnswer: boolean;
}
