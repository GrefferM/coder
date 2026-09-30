export interface SaidRowProps {
  /** One sentence of the app's own, upper-cased by the rule it stands on. */
  words: string | null;
  /** Set when the sentence is one a repeat answers; the act sits under the rule. */
  onAskAgain?: (() => void) | null;
}
