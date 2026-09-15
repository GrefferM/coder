export interface SaidRowProps {
  /** One sentence of the app's own, said upper case by the rule it stands on. */
  words: string | null;
  /** Set where the sentence is one a repeat answers — the act stands under the rule. */
  onAskAgain?: (() => void) | null;
}
