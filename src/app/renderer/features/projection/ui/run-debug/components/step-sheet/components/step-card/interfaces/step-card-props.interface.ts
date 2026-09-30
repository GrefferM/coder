import type { WholeStep } from "../../../../../../../../record";

/** The step the card is about, and whether it sits beside the name rather than in its own row. */
export interface StepCardProps {
  step: WholeStep;
  isBeside: boolean;
}
