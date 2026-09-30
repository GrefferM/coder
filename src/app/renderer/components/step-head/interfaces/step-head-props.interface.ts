/** Whose the step is, what it is about, and where back leads; the label is read aloud. */
export interface StepHeadProps {
  whose: string;
  name: string;
  backLabel: string;
  onBack: () => void;
}
