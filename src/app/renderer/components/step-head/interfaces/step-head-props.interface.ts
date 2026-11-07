/** Whose the step is, what it is about, and where back leads; the label is read aloud. */
export interface StepHeadProps {
  whose: string;
  /** Empty where the thing has no name to say, and the head is whose alone. */
  name: string;
  backLabel: string;
  onBack: () => void;
}
