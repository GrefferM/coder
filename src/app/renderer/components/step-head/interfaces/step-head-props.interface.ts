/** Whose the step is, what it is about, and where the way back leads — the label is read aloud, so it names it. */
export interface StepHeadProps {
  whose: string;
  name: string;
  backLabel: string;
  onBack: () => void;
}
