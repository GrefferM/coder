import type { WholeStep } from "../../../../../../../../record";

/** Inputs of the card: the step it is about, and whether it stands beside the name instead of a row of its own. */
export interface StepCardProps {
  step: WholeStep;
  isBeside: boolean;
}
