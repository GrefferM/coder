import type { WholeStep } from "../../../../../../record";

export interface StepSheetProps {
  /** The step that stands open, read back from the record. */
  step: WholeStep;
  /** The pass it belongs to: what fed it and where it stands are named off the steps around it. */
  walk: WholeStep[];
  /** The field is too narrow for the sheet to stand beside the graph, so it lies along the bottom. */
  isBelow: boolean;
  /** The foot walks to the step on either side. */
  onGo: (stepId: string) => void;
  onClose: () => void;
}
